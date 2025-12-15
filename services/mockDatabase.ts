import { ToolNames } from '../types';

/**
 * This service mimics a backend database connection.
 * In a real app, these would be API calls to your backend servers.
 */

export const executeTool = async (name: string, args: any): Promise<any> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log(`Executing Tool: ${name} with args:`, args);

  switch (name) {
    case ToolNames.KELOLA_DOKTER_STAF:
      return handleStaffQuery(args.query_detail);
    case ToolNames.CARI_INFORMASI_MEDIS:
      return handleMedicalQuery(args.topik);
    case ToolNames.AKUNTANSI_RUMAH_SAKIT:
      return handleAccountingQuery(args.permintaan_keuangan);
    case ToolNames.MANAJEMEN_PASIEN:
      return handlePatientQuery(args.jenis_permintaan);
    case ToolNames.JADWAL_JANJI_TEMU:
      return handleAppointmentQuery(args.aksi);
    default:
      return { error: "Tool not found" };
  }
};

const handleStaffQuery = (query: string) => {
  if (query.toLowerCase().includes("budi")) {
    return {
      name: "Dr. Budi Santoso",
      specialty: "Kardiologi",
      status: "Available",
      next_available: "Today, 14:00",
      location: "Wing A, Room 302"
    };
  }
  return {
    result: "Daftar Staf IGD saat ini: Dr. Sarah (Shift Pagi), Ners Tono, Ners Lina. Kapasitas penuh."
  };
};

const handleMedicalQuery = (topic: string) => {
  return {
    topic: topic,
    summary: `Informasi klinis untuk ${topic}: Protokol standar menyarankan observasi tanda vital setiap 4 jam. Jika terkait gejala infeksi, lakukan pemeriksaan darah lengkap (CBC).`,
    source: "Hospital Internal Protocols v2.4"
  };
};

const handleAccountingQuery = (request: string) => {
  return {
    status: "Success",
    data: {
      type: "Billing Inquiry",
      details: "Tagihan Pasien Rawat Inap #4521",
      amount_due: "Rp 15.450.000",
      insurance_status: "Pending Approval (BPJS)",
      last_updated: "2023-10-27"
    }
  };
};

const handlePatientQuery = (request: string) => {
  return {
    patient_id: "MR-99821",
    name: "Siti Aminah",
    dob: "1985-04-12",
    last_admission: "2023-10-20",
    diagnosis: "Acute Bronchitis",
    discharge_status: "Scheduled for tomorrow"
  };
};

const handleAppointmentQuery = (action: string) => {
  return {
    action_performed: action,
    status: "Confirmed",
    confirmation_code: "APP-8821-X",
    note: "Sistem telah memperbarui slot waktu. Notifikasi SMS telah dikirim ke pasien."
  };
};