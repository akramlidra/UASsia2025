import { GoogleGenAI, Type, FunctionDeclaration, Tool, Content } from "@google/genai";
import { ToolNames } from "../types";
import { executeTool } from "./mockDatabase";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 1. System Instructions ---
const SYSTEM_INSTRUCTION = `
Anda adalah Agen Koordinator Utama yang cerdas bernama "Hospital Management Assistant".
Tugas utama Anda adalah MENGINTERPRETASIKAN permintaan pengguna terkait manajemen rumah sakit dan MENGARAHKAN permintaan tersebut ke salah satu dari lima alat (Tool) spesialis yang tersedia.

**ATURAN UTAMA:**
1. Anda tidak boleh menjawab pertanyaan yang memerlukan data faktual atau eksekusi tindakan tanpa memanggil fungsi spesialis yang sesuai terlebih dahulu.
2. Gunakan deskripsi fungsi untuk memutuskan alat mana yang paling tepat untuk menyelesaikan tugas.
3. Jika Anda berhasil memanggil Tool, jelaskan hasil yang diperoleh dari Tool tersebut kepada pengguna dalam bahasa yang profesional, sopan, dan mudah dipahami (Bahasa Indonesia).
4. Jika permintaan pengguna bersifat umum (misalnya, salam atau pujian), Anda boleh meresponsnya secara langsung tanpa memanggil Tool.
5. Fokus pada lima domain utama: Jadwal Staf/Dokter, Informasi Medis, Akuntansi/Penagihan, Catatan Pasien, dan Penjadwalan Janji Temu.
`;

// --- 2. Tool Definitions ---

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: ToolNames.KELOLA_DOKTER_STAF,
        description: "Menangani pertanyaan yang berkaitan dengan jadwal, informasi staf, dan alokasi sumber daya di dalam rumah sakit. Gunakan fungsi ini untuk mencari ketersediaan dokter.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query_detail: {
              type: Type.STRING,
              description: "Detail pertanyaan tentang staf atau dokter (Contoh: 'Jadwal Dr. Budi', 'Daftar Staf IGD')"
            }
          },
          required: ["query_detail"]
        }
      },
      {
        name: ToolNames.CARI_INFORMASI_MEDIS,
        description: "Menyediakan informasi mengenai penyakit, gejala, perawatan, dan pengetahuan medis umum. Gunakan fungsi ini untuk pertanyaan yang bersifat konsultatif atau berbasis pengetahuan.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            topik: {
              type: Type.STRING,
              description: "Topik medis yang ditanyakan (Contoh: 'Gejala Demam Berdarah', 'Perawatan Pasca Operasi')"
            }
          },
          required: ["topik"]
        }
      },
      {
        name: ToolNames.AKUNTANSI_RUMAH_SAKIT,
        description: "Mengelola fungsi keuangan, termasuk catatan keuangan, penagihan (billing), penggajian (payroll), dan fungsi akuntansi lainnya.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            permintaan_keuangan: {
              type: Type.STRING,
              description: "Detail permintaan keuangan (Contoh: 'Cek tagihan pasien X', 'Kapan penggajian bulan ini?')"
            }
          },
          required: ["permintaan_keuangan"]
        }
      },
      {
        name: ToolNames.MANAJEMEN_PASIEN,
        description: "Mengelola catatan pasien, penerimaan (admissions), pemulangan (discharges), dan riwayat medis pasien.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            jenis_permintaan: {
              type: Type.STRING,
              description: "Jenis aksi atau data pasien yang dibutuhkan (Contoh: 'Cek riwayat medis', 'Proses pemulangan pasien Y')"
            }
          },
          required: ["jenis_permintaan"]
        }
      },
      {
        name: ToolNames.JADWAL_JANJI_TEMU,
        description: "Menangani pemesanan (booking), modifikasi, dan pembatalan janji temu pasien.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            aksi: {
              type: Type.STRING,
              description: "Aksi penjadwalan yang diinginkan (Contoh: 'Batalkan janji Dr. Rina', 'Pesan janji untuk besok')"
            }
          },
          required: ["aksi"]
        }
      }
    ]
  }
];

// --- 3. Chat Logic with Function Calling ---

export const sendMessageToGemini = async (
  history: Content[], 
  message: string,
  onToolCallStart: (toolName: string) => void
): Promise<{ text: string, toolUsed?: string, toolResult?: any }> => {
  
  const modelId = "gemini-2.5-flash"; // Using a fast model for responsive tool calling

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
        temperature: 0.5, // Lower temperature for more deterministic tool use
      },
      history: history
    });

    // 1. Send user message
    const result = await chat.sendMessage({ message });
    
    // 2. Check for Function Calls
    // The SDK handles the parsing. We check if the model wants to call a tool.
    const candidates = result.candidates;
    if (!candidates || candidates.length === 0) throw new Error("No response from Gemini");

    const firstPart = candidates[0].content.parts[0];
    
    // Check if there is a function call in the response
    if (firstPart.functionCall) {
      const fc = firstPart.functionCall;
      const toolName = fc.name;
      const toolArgs = fc.args;

      // Notify UI that a tool is running
      onToolCallStart(toolName);

      // 3. Execute the local function (Mock DB)
      const functionResponse = await executeTool(toolName, toolArgs);

      // 4. Send the tool execution result back to Gemini
      // The SDK creates a new turn. We send the functionResponse.
      const result2 = await chat.sendMessage({
        content: {
          role: 'function',
          parts: [{
            functionResponse: {
              name: toolName,
              response: { result: functionResponse }
            }
          }]
        }
      });

      return {
        text: result2.text || "Processed successfully.",
        toolUsed: toolName,
        toolResult: functionResponse
      };
    }

    // No tool called, just return text
    return { text: result.text || "" };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Maaf, terjadi kesalahan saat menghubungkan ke sistem rumah sakit." };
  }
};