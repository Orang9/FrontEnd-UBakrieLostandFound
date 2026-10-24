export const claimHistory = [
  {
    id: 'CL-0147',
    item: {
      id: 'dompet-kartu-identitas',
      name: 'Dompet / kartu identitas',
      icon: 'wallet',
      category: 'Sensitif',
    },
    status: 'APPROVED',
    detailed: true,
    steps: [
      {
        key: 'SUBMITTED',
        label: 'Klaim dikirim',
        time: '12 Okt, 08.10',
        complete: true,
      },
      {
        key: 'VERIFYING',
        label: 'Verifikasi manual Admin BEM',
        time: '12 Okt, 10.45',
        complete: true,
      },
      {
        key: 'APPROVED',
        label: 'Disetujui (APPROVED)',
        time: '12 Okt, 11.02',
        complete: true,
      },
      {
        key: 'SCHEDULED',
        label: 'Jadwal dipilih (TERJADWAL)',
        time: '-',
        complete: false,
      },
      {
        key: 'CLAIMED',
        label: 'Diambil (CLAIMED)',
        time: '-',
        complete: false,
      },
    ],
  },
  {
    id: 'CL-0139',
    item: { name: 'Kunci motor Honda', icon: 'key', category: 'Umum' },
    status: 'CLAIMED',
    detailed: false,
  },
  {
    id: 'CL-0121',
    item: { name: 'Tas ransel hitam', icon: 'backpack', category: 'Umum' },
    status: 'REJECTED',
    detailed: false,
  },
];

export const reportHistory = [
  {
    id: 'RP-0108',
    item: {
      name: 'Dompet / kartu identitas',
      icon: 'wallet',
      category: 'Sensitif',
    },
    type: 'Temuan',
    status: 'AVAILABLE',
    date: '9 Okt',
  },
  {
    id: 'RP-0096',
    item: { name: 'Kunci motor Honda', icon: 'key', category: 'Umum' },
    type: 'Hilang',
    status: 'AVAILABLE',
    date: '7 Okt',
  },
];
