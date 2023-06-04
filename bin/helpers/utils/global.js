/* eslint-disable indent */
const fs = require('fs');
const base64 = require('base-64');
const utf8 = require('utf8');
const xlsx = require('node-xlsx').default;
const wrapper = require('../utils/wrapper');

const encodeBase64 = (val) => {
  const bytes = utf8.encode(val);
  const encoded = base64.encode(bytes);
  return encoded;
};

const decodeBase64 = (encode) => {
  const bytes = base64.decode(encode);
  const text = utf8.decode(bytes);
  return text;
};

const numberFormat = (value) => {
  return new Intl.NumberFormat('ID').format(value);
};

const stringValid = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\w\S*/g, (val) => {
      if (val.toUpperCase() == 'PT.' || val.toUpperCase() == 'CV.') {
        const newStr = val.toUpperCase();
        return newStr;
      }
      const newStr = val.slice(0, 1).toUpperCase() + val.substr(1);
      return newStr;
    })
    .replace(/\s+/g, ' ');
};

const dateValid = (str) => {
  return str.split('/').reverse().join('/');
};

const statusPipeline = (val) => {
  switch (val) {
    case 1:
      return 'Data Belum Lengkap';
    case 2:
      return 'Belum Pre-Screening';
    case 3:
      return 'Sedang Pre-Screening';
    case 4:
      return 'Pre-Screening Selesai';
    case 5:
      return 'Pre-Screening Gagal';
    default:
      return '';
  }
};

const statusPrakarsa = (val) => {
  switch (val) {
    case 1:
      return 'Lengkapi Informasi Prakarsa';
    case 2:
      return 'Siap Dikirim ke Checker';
    case 3:
      return 'Verifikasi ADK';
    case 4:
      return 'Verifikasi CBL';
    case 5:
      return 'Menunggu Putusan';
    case 6:
      return 'Offering Debitur';
    case 7:
      return 'Akad Kredit';
    case 8:
      return 'Pembuatan Fasilitas';
    default:
      return '';
  }
};

const pipelineType = (val) => {
  switch (val) {
    case 1:
      return 'Perorangan';
    case 2:
      return 'Perusahaan - CV';
    case 3:
      return 'Perusahaan - PT';
    case 4:
      return 'Perorangan - PARI';
    default:
      return '';
  }
};

const lpgStatus = (val, title) => {
  switch (val) {
    case 'GREEN':
      return {
        status: 'Lolos',
        reason: `Lokasi usaha "${title}" berada di zona hijau`,
      };
    case 'YELLOW':
      return {
        status: 'Lolos',
        reason: `Lokasi usaha "${title}" berada di zona hijau`,
      };
    case 'RED':
      return {
        status: 'Ditolak',
        reason: `Lokasi usaha "${title}" berada di zona merah`,
      };
    case 'ORANGE':
      return {
        status: 'Ditolak',
        reason: `Lokasi usaha "${title}" berada di zona merah`,
      };
    default:
      return '';
  }
};

const statusIndividualDHN = (val, title) => {
  if (val.length == 0)
    return { status: 'Gagal', reason: 'Service Brigde Fail' };
  let statusDebitur;
  let spouseDebiturResult;
  for (let i = 0; i < val.length; i++) {
    if (val[i].data === null)
      return { status: 'Gagal', reason: 'Service Brigde Fail' };
    if (i == 0) {
      if (val[i].statusCode == 1 && val[i].data.length == 0) {
        statusDebitur = 'Lolos';
      } else if (val[i].statusCode == 1 && val[i].data.length > 0) {
        statusDebitur = 'Ditolak';
      } else {
        statusDebitur = 'Gagal';
      }
    } else if (i == 1) {
      if (val[i].statusCode == 1 && val[i].data.length == 0) {
        spouseDebiturResult = 'Lolos';
      } else if (val[i].statusCode == 1 && val[i].data.length > 0) {
        spouseDebiturResult = 'Ditolak';
      } else {
        spouseDebiturResult = 'Gagal';
      }
    }
  }

  if (statusDebitur == 'Lolos' && spouseDebiturResult == 'Lolos') {
    return {
      status: 'Lolos',
      reason: {
        debitur: {
          status: 'Lolos',
          text: `"${title.debitur}" tidak termasuk dalam kategori DHN`,
        },
        spouseDebitur: {
          status: 'Lolos',
          text: `"${title.spouseDebitur}" tidak termasuk dalam kategori DHN`,
        },
      },
    };
  }

  let textDeb = '';
  if (statusDebitur == 'Lolos') {
    textDeb = `"${title.debitur}" tidak termasuk dalam kategori DHN`;
  } else if (statusDebitur == 'Ditolak') {
    textDeb = `"${title.debitur}" termasuk dalam kategori DHN`;
  } else if (statusDebitur == 'Gagal') {
    textDeb = `"${title.debitur}" gagal get data DHN`;
  }
  let textSupDeb = '';
  if (statusDebitur == 'Lolos') {
    textSupDeb = `"${title.debitur}" tidak termasuk dalam kategori DHN`;
  } else if (statusDebitur == 'Ditolak') {
    textSupDeb = `"${title.debitur}" termasuk dalam kategori DHN`;
  } else if (statusDebitur == 'Gagal') {
    textSupDeb = `"${title.debitur}" gagal get data DHN`;
  }
  if (!spouseDebiturResult) {
    return {
      status: statusDebitur,
      reason: {
        debitur: { status: statusDebitur, text: textDeb },
        spouseDebitur: '',
      },
    };
  }
  return {
    status: 'Ditolak',
    reason: {
      debitur: { status: statusDebitur, text: textDeb },
      spouseDebitur: { status: spouseDebiturResult, text: textSupDeb },
    },
  };
};

const statusIndividualDukcapil = (val, data) => {
  if (val.length == 0)
    return { status: 'Gagal', reason: 'Service Brigde Fail' };
  let flagResult = 1;
  let statusDebitur = [];
  let spouseDebitur = [];
  for (let i = 0; i < val.length; i++) {
    if (val[i].data === null) return 'Gagal';
    const object = val[i].data;
    for (const field in object) {
      if (field != 'motherMaidenName') {
        if (object[field] == 0) {
          flagResult = 0;
          if (i == 0) {
            let fieldName;
            switch (field) {
              case 'ktpNumber':
                fieldName = decodeBase64(data[0].noKTP);
                break;
              case 'name':
                fieldName = decodeBase64(data[0].namaLengkap);
                break;
              case 'placeOfBirth':
                fieldName = decodeBase64(data[0].tempatLahir);
                break;
              case 'birthDate':
                fieldName = dateFormatID(data[0].tanggalLahir).newDate;
                break;
              default:
                break;
            }
            statusDebitur.push({
              field: field,
              fieldName: fieldName,
              result: field == 'ktpNumber' ? 'Tidak Ditemukan' : 'Tidak Sesuai',
            });
          } else {
            let fieldNameSup;
            switch (field) {
              case 'ktpNumber':
                fieldNameSup = decodeBase64(data[1].noKTP);
                break;
              case 'name':
                fieldNameSup = decodeBase64(data[1].namaLengkap);
                break;
              case 'placeOfBirth':
                fieldNameSup = decodeBase64(data[1].tempatLahir);
                break;
              case 'birthDate':
                fieldNameSup = dateFormatID(data[1].tanggalLahir).newDate;
                break;
              default:
                break;
            }
            spouseDebitur.push({
              field: field,
              fieldName: fieldNameSup,
              result: field == 'ktpNumber' ? 'Tidak Ditemukan' : 'Tidak Sesuai',
            });
          }
        } else if (object[field] == 1) {
          if (i == 0) {
            let fieldName;
            switch (field) {
              case 'ktpNumber':
                fieldName = decodeBase64(data[0].noKTP);
                break;
              case 'name':
                fieldName = decodeBase64(data[0].namaLengkap);
                break;
              case 'placeOfBirth':
                fieldName = decodeBase64(data[0].tempatLahir);
                break;
              case 'birthDate':
                fieldName = dateFormatID(data[0].tanggalLahir).newDate;
                break;
              default:
                break;
            }
            statusDebitur.push({
              field: field,
              fieldName: fieldName,
              result: field == 'ktpNumber' ? 'Ditemukan' : 'Sesuai',
            });
          } else {
            let fieldNameSup;
            switch (field) {
              case 'ktpNumber':
                fieldNameSup = decodeBase64(data[1].noKTP);
                break;
              case 'name':
                fieldNameSup = decodeBase64(data[1].namaLengkap);
                break;
              case 'placeOfBirth':
                fieldNameSup = decodeBase64(data[1].tempatLahir);
                break;
              case 'birthDate':
                fieldNameSup = dateFormatID(data[1].tanggalLahir).newDate;
                break;
              default:
                break;
            }
            spouseDebitur.push({
              field: field,
              fieldName: fieldNameSup,
              result: field == 'ktpNumber' ? 'Ditemukan' : 'Sesuai',
            });
          }
        }
      }
    }
  }
  if (flagResult == 0) {
    return {
      status: 'Ditolak',
      reason: { debitur: statusDebitur, spouseDebitur: spouseDebitur },
    };
  }
  return {
    status: 'Lolos',
    reason: { debitur: statusDebitur, spouseDebitur: spouseDebitur },
  };
};

const dateFormatID = (val) => {
  if (!val) return null;
  if (val.toString().split('-').length > 1 && val.length <= 10) {
    val = val.replace('0', '').split('-').reverse().join('-');
  }
  const date = new Date(val);
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  let monthName;

  switch (m) {
    case 0:
      monthName = 'Januari';
      break;
    case 1:
      monthName = 'Februari';
      break;
    case 2:
      monthName = 'Maret';
      break;
    case 3:
      monthName = 'April';
      break;
    case 4:
      monthName = 'Mei';
      break;
    case 5:
      monthName = 'Juni';
      break;
    case 6:
      monthName = 'Juli';
      break;
    case 7:
      monthName = 'Agustus';
      break;
    case 8:
      monthName = 'September';
      break;
    case 9:
      monthName = 'Oktober';
      break;
    case 10:
      monthName = 'November';
      break;
    case 11:
      monthName = 'Desember';
      break;
  }

  return {
    date: val,
    newDate: `${d.toString().length == 1 ? '0' + d : d} ${monthName} ${y}`,
  };
};

const screeningResponseFinal = (obj) => {
  for (const key in obj) {
    if (obj[key] == 'Ditolak') {
      return {
        statusScreening: statusPipeline(4),
        resultScreening: 'Pre-Screening Ditolak',
      };
    }
    if (obj[key] == 'Gagal') {
      return {
        statusScreening: statusPipeline(5),
        resultScreening: 'N/A',
      };
    }
  }
  return { statusScreening: statusPipeline(4), resultScreening: 'LOLOS' };
};

const dateFormatDukcapil = (val) => {
  if (!val) return null;
  const date = new Date(val);
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  let monthValid;

  switch (m) {
    case 0:
      monthValid = '01';
      break;
    case 1:
      monthValid = '02';
      break;
    case 2:
      monthValid = '03';
      break;
    case 3:
      monthValid = '04';
      break;
    case 4:
      monthValid = '05';
      break;
    case 5:
      monthValid = '06';
      break;
    case 6:
      monthValid = '07';
      break;
    case 7:
      monthValid = '08';
      break;
    case 8:
      monthValid = '09';
      break;
    case 9:
      monthValid = '10';
      break;
    case 10:
      monthValid = '11';
      break;
    case 11:
      monthValid = '12';
      break;
  }
  return `${d.toString().length == 1 ? '0' + d : d}-${monthValid}-${y}`;
};

const statusAgunanPokok = (val) => {
  switch (val) {
    case 1:
      return 'Data Lengkap';
    case 2:
      return 'Belum Lengkap';
    default:
      return '';
  }
};

const dateFormatSlik = (val) => {
  if (!val) return null;
  const date = new Date(val);
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  let mNew;
  switch (m) {
    case 0:
      mNew = '01';
      break;
    case 1:
      mNew = '02';
      break;
    case 2:
      mNew = '03';
      break;
    case 3:
      mNew = '04';
      break;
    case 4:
      mNew = '05';
      break;
    case 5:
      mNew = '06';
      break;
    case 6:
      mNew = '07';
      break;
    case 7:
      mNew = '08';
      break;
    case 8:
      mNew = '09';
      break;
    case 9:
      mNew = '10';
      break;
    case 10:
      mNew = '11';
      break;
    case 11:
      mNew = '12';
      break;
  }
  return `${y}-${mNew}-${d.toString().length == 1 ? '0' + d : d}`;
};

const statusDashboardADK = (val) => {
  switch (val) {
    case 0:
      return 'Melengkapi Data Pre-Screening';
    case 1:
      return 'Menunggu Hasil Pre-Screening';
    case 2:
      return 'Pre-Screening Disetujui';
    case 3:
      return 'Melengkapi Data Analisa Pinjaman';
    case 4:
      return 'Verifikasi oleh ADK';
    case 5:
      return 'Verifikasi oleh CBL';
    case 6:
      return 'Menunggu Putusan CBL';
    case 7:
      return 'Menunggu Putusan Kadiv';
    case 8:
      return 'Prakarsa Disetujui, Proses Offering Letter';
    case 9:
      return 'Proses Akad Kredit';
    case 10:
      return 'Proses Pembuatan Fasilitas';
    case -1:
      return 'Pre-Screening Ditolak';
    case -2:
      return 'Offering Letter Ditolak';
    case -3:
      return 'Isi Prakarsa Dibatalkan AO';
    default:
      return '';
  }
};

const jenisAgunanPokok = (val) => {
  switch (val) {
    case 193:
      return 'Persediaan';
    case 250:
      return 'Piutang';
    default:
      return '';
  }
};

const jenisAgunanTambahan = (val) => {
  switch (val) {
    case 161:
      return 'Properti Komersial';
    case 162:
      return 'Gudang';
    case 163:
      return 'Rumah Toko / Rumah Kantor';
    case 164:
      return 'Hotel';
    case 175:
      return 'Gedung - Lainnya';
    case 176:
      return 'Rumah Tinggal';
    case 177:
      return 'Apartemen / Rumah Susun';
    case 187:
      return 'Tanah';
    case 189:
      return 'Kendaraan Bermotor';
    case '010':
      return 'Cash Collateral';
    case 190:
      return 'Mesin';
    default:
      return '';
  }
};

const base64Encode = (file) => {
  return fs.readFileSync(file, { encoding: 'base64' });
};

const statusInfoPrakarsaHeader = (val) => {
  switch (val) {
    case 'Lengkapi Informasi Prakarsa':
      return 'Lengkapi Informasi Prakarsa';
    case 'Siap Dikirim ke Checker':
      return 'Siap Dikirim ke Checker';
    case 'Revisi ADK - 1':
      return 'Revisi ADK - 1';
    case 'Revisi ADK - 2':
      return 'Revisi ADK - 2';
    case 'Revisi ADK - 3':
      return 'Revisi ADK - 3';
    case 'Revisi ADK - 4':
      return 'Revisi ADK - 4';
    case 'Revisi ADK - 5':
      return 'Revisi ADK - 5';
    case 'Revisi ADK - 6':
      return 'Revisi ADK - 6';
    case 'Revisi ADK - 7':
      return 'Revisi ADK - 7';
    case 'Revisi ADK - 8':
      return 'Revisi ADK - 8';
    case 'Revisi ADK - 9':
      return 'Revisi ADK - 9';
    case 'Revisi ADK - 10':
      return 'Revisi ADK - 10';
    case 'Revisi CBL - 1':
      return 'Revisi CBL - 1';
    case 'Revisi CBL - 2':
      return 'Revisi CBL - 2';
    case 'Revisi CBL - 3':
      return 'Revisi CBL - 3';
    case 'Revisi CBL - 4':
      return 'Revisi CBL - 4';
    case 'Revisi CBL - 5':
      return 'Revisi CBL - 5';
    case 'Revisi CBL - 6':
      return 'Revisi CBL - 6';
    case 'Revisi CBL - 7':
      return 'Revisi CBL - 7';
    case 'Revisi CBL - 8':
      return 'Revisi CBL - 8';
    case 'Revisi CBL - 9':
      return 'Revisi CBL - 9';
    case 'Revisi CBL - 10':
      return 'Revisi CBL - 10';
    case 'Revisi Pemutus Pusat - 1':
      return 'Revisi Pemutus Pusat - 1';
    case 'Revisi Pemutus Pusat - 2':
      return 'Revisi Pemutus Pusat - 2';
    case 'Revisi Pemutus Pusat - 3':
      return 'Revisi Pemutus Pusat - 3';
    case 'Revisi Pemutus Pusat - 4':
      return 'Revisi Pemutus Pusat - 4';
    case 'Revisi Pemutus Pusat - 5':
      return 'Revisi Pemutus Pusat - 5';
    case 'Revisi Pemutus Pusat - 6':
      return 'Revisi Pemutus Pusat - 6';
    case 'Revisi Pemutus Pusat - 7':
      return 'Revisi Pemutus Pusat - 7';
    case 'Revisi Pemutus Pusat - 8':
      return 'Revisi Pemutus Pusat - 8';
    case 'Revisi Pemutus Pusat - 9':
      return 'Revisi Pemutus Pusat - 9';
    case 'Revisi Pemutus Pusat - 10':
      return 'Revisi Pemutus Pusat - 10';
    case 'Verifikasi ADK':
    case 'Verifikasi CBL':
    case 'Menunggu Putusan':
      return 'Dokumen dalam proses verifikasi & tandatangan';
    case 'Offering Debitur':
      return 'PTK selesai ditandatangan';
    case 'Akad Kredit':
      return 'Dokumen dalam proses akad kredit';
    case 'Pembuatan Fasilitas':
      return 'Dokumen dalam proses pembuatan fasilitas';
    case 'Prakarsa Ditolak':
      return 'Pemutus Menolak Memberikan Kredit';
    case 'Offering Letter Ditolak':
      return 'Offering Letter Ditolak';
    case 'Belum ada pencairan':
      return 'Belum ada pencairan';
    default:
      return '';
  }
};

const checkField = async (fieldTamplate, field) => {
  if (!Array.isArray(field)) {
    return true;
  }
  if (fieldTamplate.length != field.length) {
    return true;
  }
  for (const idx in fieldTamplate) {
    if (field[idx] != fieldTamplate[idx]) {
      return true;
    }
  }
  return false;
};

const calculation = async (val) => {
  Object.keys(val).forEach((key) => {
    if (key != 'periode') val[key] = parseFloat(val[key]);
  });
  let {
    periode,
    neraca_totalHutang,
    neraca_totalModal,
    neraca_aktivaLancar,
    neraca_totalHutangJangkaPendek,
    labaRugi_labaBersih,
    labaRugi_biayaBunga,
    neraca_persediaan,
    labaRugi_penjualan,
    neraca_totalAktiva,
    neraca_totalPasiva,
    labaRugi_biayaHPP,
    neraca_piutangDagang,
    labaRugi_biayaPenyusutan,
    labaRugi_pajak,
  } = val;
  let result = {
    DER: null,
    ROE: null,
    CR: null,
    ROA: null,
    ICR: null,
    DOP: null,
    QR: null,
    ROI: null,
    DOI: null,
    NWC_Positif: null,
    DOR: null,
    EBITDA: null,
    NPM: null,
    periode: null,
  };
  const bulanBerjalan = periode / 30;
  const ebitda =
    labaRugi_labaBersih +
    labaRugi_biayaPenyusutan +
    labaRugi_pajak +
    labaRugi_biayaBunga;
  result.DER = (neraca_totalHutang / neraca_totalModal) * 100;
  result.CR = (neraca_aktivaLancar / neraca_totalHutangJangkaPendek) * 100;
  result.EBITDA = ebitda;
  result.ICR = (ebitda / labaRugi_biayaBunga) * 100;
  result.QR =
    ((neraca_aktivaLancar - neraca_persediaan) /
      neraca_totalHutangJangkaPendek) *
    100;
  result.NWC_Positif = neraca_aktivaLancar - neraca_totalHutangJangkaPendek;
  result.NPM = (labaRugi_labaBersih / labaRugi_penjualan) * 100;
  result.ROE =
    (((labaRugi_labaBersih / bulanBerjalan) * 12) / neraca_totalModal) * 100;
  result.ROA =
    (((labaRugi_labaBersih / bulanBerjalan) * 12) / neraca_totalAktiva) * 100;
  result.ROI =
    ((labaRugi_penjualan - neraca_totalPasiva) / neraca_totalPasiva) * 100;
  result.DOP = (neraca_totalHutang / labaRugi_biayaHPP) * periode;
  result.DOI = (neraca_persediaan / labaRugi_biayaHPP) * periode;
  result.DOR = (neraca_piutangDagang / labaRugi_penjualan) * periode;
  Object.keys(result).forEach((key) => {
    if (!isFinite(result[key])) {
      result[key] = NaN;
    }
  });
  return result;
};

const descriptionNonFinance = async (val, result) => {
  switch (val) {
    case 1:
      return [
        // tingkatKepercayaan
        {
          desc: 'Sebagian atau keseluruhan informasi yang diberikan tidak sesuai dengan kondisi sebenarnya.',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Sebagian atau seluruh informasi yang diberikan tidak sesuai dengan kondisi sebenarnya namun debitur secara aktif menyampaikannya.',
          result: result == 2 ? true : false,
        },
        {
          desc: 'Informasi yang diberikan debitur sesuai dengan kondisi sebenarnya namun baru diberikan bila diminta.',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Informasi yang diberikan debitur sesuai dengan kondisi sebenarnya dan debitur secara aktif menyampaikannya.',
          result: result == 4 ? true : false,
        },
      ];
    case 2:
      return [
        // pengelolaanRekeningBank
        {
          desc: `Janji tidak ditepati (masih terdapat kewajiban yang belum diselesaikan atau pernah terlambat membayar kewajibannya di bank lain atau di BRI Agro minimum 3 kali dalam 1 tahun).
Terdapat dokmen yang belum dipenuhi baik sebagai deposan maupun debitur atau melanggar perjanjian kredit dan tidak ada surat keterangan dari debitur maupun dari bank lain atau BRI Agro.
Selalu menepati janji yang dibuat dengan Bank.
Tidak pernah terlambat membayar.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Tidak menepati janji (terlambat membayar (tidak lebih dari 2 kali dalam 1 tahun).
Terlambat memenuhi kelengkapan dokumen atau tidak memenuhi perjanjian kredit, tapi dapat diperbaiki dengan segera.
Informasi terbatas dikarenakan belum menjadi nasabah pada Bank namun telah memenuhi dokumentasi primer (pokok) yang dipersyaratkan sebagai calon nasabah.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Pernah tidak menepati janji (terlambat membayar tidak lebih dari 1 kali dalam 1 tahun).
Terlambat memenuhi kelengkapan dokumen atau tidak memenuhi perjanjian kredit, dengan alasan yang dapat diterima bank.
Nasabah baru (harus take over) dengan bukti-bukti yang diperoleh dari calon debitur dan pihak ketiga, termasuk pemenuhan kelengkapan dokumen.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Selalu menepati janji yang dibuat dengan bank.
Tidak pernah terlambat membayar.
Memenuhi kelengkapan dokumen dan memenuhi perjanjian kredit.`,
          result: result == 4 ? true : false,
        },
      ];
    case 3:
      return [
        // reputasiBisnis
        {
          desc: 'Terdapat informasi negatif dari supplier/pelanggan/perusahaan sejenis namun tidak dapat dijelaskan oleh nasabah disertai bukti tertulis yang memadai.',
          result: result == 1 ? true : false,
        },
        {
          desc: `Terdapat informasi negatif dari supplier/pelanggan/perusahaan sejenis namun dapat dijelaskan oleh nasabah
disertai bukti yang memadai, Informasi tentang hubungan bisnis terbatas dikarenakan pelaku usaha baru
dibidangnya namun telah memenuhi dokumentasi primer (pokok) yang dipersyaratkan oleh ketentuan yang
berlaku dalam menjalankan kegiatan usahanya.`,
          result: result == 2 ? true : false,
        },
        {
          desc: 'Tidak terdapat informasi negatif dari supplier atau konsumen atau perusahaan sejenis mencangkup hubungan bisnis dalam jangka waktu < 2 tahun.',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Tidak terdapat informasi negatif dari supplier atau konsumen atau perusahaan sejenis mencangkup hubungan bisnis dalam jangka waktu ≥ 2 tahun.',
          result: result == 4 ? true : false,
        },
      ];
    case 4:
      return [
        // perilakuDebitur
        {
          desc: 'Debitur memiliki gaya hidup atau permasalahan pribadi yang dapat mengurangi kemampuan membayar kredit pada saat ini atau masa mendatang.',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Informasi dan data mengenai gaya hidup dan riwayat pribadi terbatas dikarenakan yang bersangkutan merupakan nasabah baru.',
          result: result == 2 ? true : false,
        },
        {
          desc: 'Debitur tidak memiliki gaya hidup atau permasalahan pribadi yang dapat mengurangi kemampuan membayar kredit pada saat ini.',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Debitur tidak memiliki gaya hidup atau permasalahan pribadi yang dapat mengurangi kemampuan membayar kredit pada saat ini dan masa mendatang.',
          result: result == 4 ? true : false,
        },
      ];
    case 5:
      return [
        // kualitasProduk/Jasa
        {
          desc: `Jenis produk/barang dagangan/jasa tidak memenuhi kebutuhan pembeli.
Harga jual lebih mahal dibandingkan pesaing.
Pemenuhan pesanan lebih lambat dari pesaing dan tidak dapat diterima.
Personil tidak trampil dan tidak bersahabat.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Jenis produk/barang dagangan/jasa kurang memenuhi kebutuhan pembeli.
Harga jual masih dapat bersaing.
Pemenuhan pesanan lebih lambat dari pesaing namun masih dapat diterima.
Personil bersahabat namun kurang terampil.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Jenis produk/barang dagangan/jasa cukup memenuhi kebutuhan pembeli.
Htarga jual relatif sama dibanding pesaing.
Pemenuhan pesanan sama cepat dengan pesaing.
Personil terampil namun kurang bersahabat.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Jenis produk/barang dagangan/jasa memenuhi kebutuhan pembeli.
Harga jual lebih murah dibanding pesaing.
Pemenuhan pesanan lebih cepat dari pesaing.
Personil terampil dan bersahabat.`,
          result: result == 4 ? true : false,
        },
      ];
    case 6:
      return [
        // strategiDanKetergantungan
        {
          desc: `Nasabah tidak memiliki strategi pemasaran.
Sangat tergantung pada supplier/pembeli tertentu.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Nasabah memiliki strategi pemasaran yang kurang tepat.
Terdapat ketergantungan pada supplier/pembeli tertentu.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Nasabah memiliki strategi pemasaran yang cukup tepat.
Tidak terdapat ketergantungan namun supplier/pembeli terbatas.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Nasabah memiliki strategi pemasaran yang tepat.
Tidak terdapat ketergantungan karena supplier/pembeli banyak dan bervariasi.`,
          result: result == 4 ? true : false,
        },
      ];
    case 7:
      return [
        // lokasiUsaha
        {
          desc: `Lokasi usaha sulit dicapai oleh pembeli/pemasok.
Sulit untuk mendapatkan tenaga kerja.
Telah terdapat pembatasan peruntukan oleh pemerintah/pihak yang berwenang atau lokasi usaha tidak sesuai dengan peruntukan.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Jalan ke lokasi usaha nasabah masih dapat dicapai.
Ketersediaan tenaga kerja memerlukan waktu yang lama atau membutuhkan biaya ekstra.
Diperkirakan akan terdapat perubahan peruntukan oleh pemerintah/pihak yang berwenang.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Tidak terdapat permasalahn bagi pembeli/pemasok untuk mencapai lokasi usaha.
Pada umumnya tidak terdapat permasalahan dalam hal ketersediaan tenaga kerja namun untuk kualifikasi tertentu sulit diperoleh.
Tidak terdapat pembatasan/perubahan peruntukan lokasi yang merugikan oleh pemerintah/pihak yang berwenang.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Lokasi usaha mudah dicapai oleh pembeli/pemasok.
Berdasarkan surat resmi dan/atau keputusan dan/atau peraturan dari pemda setempat (instansi terkait), tidak terdapat masalah dalam hal ketersediaan tenaga kerja (baik kualitas maupun kuantitas).
Berdasarkan surat resmi dan/atau keputusan dan/atau peraturan dari pemda setempat (instansi terkait), diperkirakan tidak terdapat perubahan peruntukan lokasi oleh pemerintah/ yang berwenang.`,
          result: result == 4 ? true : false,
        },
      ];
    case 8:
      return [
        // persaingan
        {
          desc: `Pasar menunjukkan penurunan.
Tidak terdapat peluang menghasilkan laba.
Jumlah pesaing meningkat dengan tajam.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Pasar tidak berkembang.
Peluang mendapatkan laba menurun.
Jumlah pesaing meningkat.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Perkembangan pasar diperkirakan tetap stabil.
Peluang mendapatkan laba stabil.
Jumlah pesaing meningkat sedikit.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Perkembangan pasar diperkirakan tetap tinggi.
Peluang untuk mendapatkan laba tinggi.
Jumlah pesaing menurun atau tetap.`,
          result: result == 4 ? true : false,
        },
      ];
    case 9:
      return [
        // kualifikasiKomersial
        {
          desc: `Debitur tidak memiliki catatan transaksi keuangan.
Pertanyaan masalah finansial dapat tidak dapat dijawab oleh debitur.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Pembukuan/pencatatan transaki keuangan hanya berupa kumpulan nota-nota.
Pertanyaan masalah finansial dapat dijawab sebagian saja(kurang dari 50%).`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Pembukuan/pencatatan transaksi keuangan dilakukan secara tertib dan teratur namun debitur belum mampu menyusun laporan keuangan yang baik sesuai dengan ETAP (Entitas Tanpa Akuntabilitas Publik) yang berlaku.
Pertanyaan masalah finansial dapat dijawab secara garis besar(lebih dari 50%) secara garis besar.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Pembukuan/pencatatan transaksi keuangan dilakukan secara tertib dan debitur mampu menyusun laporan keuangan (neraca, laporan rugi laba dll) sesuai dengan ETAP (Entitas Tanpa Akuntabilitas Publik) yang berlaku.
Pertanyaan masalah finansial dapat dijawab secara detail dan sesuai dengan pemaparan kuantitatif yang telah disampaikan di dalam laporan keuangan.`,
          result: result == 4 ? true : false,
        },
      ];
    case 10:
      return [
        // kualifikasiTeknis
        {
          desc: `Kurang memiliki keahlian atau tidak memiliki pengalaman kerja yang relevan dengan usaha yang dikelola.
Tidak memiliki motivasi untuk mengembangkan profesionalisme.
Tidak mengerti terhadap perkembangan pasar/industri, khususnya terkait dengan kegiatan usahanya.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Memiliki dasar keahlian yang kuat tetapi kurang berpengalaman (pengalaman minimal 2 tahun).
Kurang memiliki motivasi untuk mengembangkan profesionalisme.
Kurang tanggap terhadap perkembangan pasar/industri, khususnya terkait dengan kegiatan usahanya.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Memiliki keahlian yang baik dan pengalaman sebagai pengelola yang berkaitan selama < 2 tahun.
Memiliki motivasi untuk mengembangkan profesionalisme.
Cukup tanggap terhadap perkembangan pasar/industri.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Memiliki keahlian dan pengalaman sebagai pengelola usaha selama beberapa tahun(≥ 2 tahun) dalam bidang yang berkaitan.
Memiliki motivasi yang tinggi untuk mengembangkan pengetahuan dan keahlian (profesionalisme).
Selalu mengikuti perkembangan pasar/industri, khususnya terkait dengan kegiatan usahanya.`,
          result: result == 4 ? true : false,
        },
      ];
    case 11:
      return [
        // struktrurInternalPerusahaan
        {
          desc: `Tidak terdapat konsep pergantian pimpinan (kaderisasi).
Organisasi tidak disesuaikan dengan perkembangan/kebutuhan pasar.
Tenaga kerja yang digunakan sangat terbatas dan bersifat tenaga kerja lepas.`,
          result: result == 1 ? true : false,
        },
        {
          desc: `Nasabah memiliki konsep pergantian pimpinan tetapi belum menyiapkan kader.
Nasabah terlambat dalam menyesuaikan organisasi dengan perkembangan pasar.
Tenaga kerja yang digunakan cukup dan sebagian besar merupakan tenaga kerja lepas dengan tingkat turn over karyawan tetap rata-rata > 50% dari total karyawan tetap setiap tahunnya.`,
          result: result == 2 ? true : false,
        },
        {
          desc: `Nasabah memiliki konsep pergantian pimpinan tetapi kader belum siap menggantikan.
Nasabah menyesuaikan organisasi dengan perkembangan pasar (tidak proaktif).
Tenaga kerja yang digunakan cukup dan sebagian masih menggunakan tenaga kerja lepas dengan tingkat turn over karyawan tetap rata-rata > 15 % namun ≤ 50% dari total karyawan tetap setiap tahunnya.`,
          result: result == 3 ? true : false,
        },
        {
          desc: `Nasabah memiliki konsep pergantian pimpinan dan telah memiliki kader yang siap menggantikan.
Nasabah secara proaktif menyesuaikan organisasi dengan perkembangan pasar, khususnya terkait dengan kegiatan usahanya.
Tenaga kerja yang digunakan sudah memadai dan sebagian kecil menggunakan tenaga kerja lepas untuk pekerjaan tertentu dengan tingkat turn over karyawan tetap rata-rata ≤ 15% dari total karyawan tetap setiap tahunnya.`,
          result: result == 4 ? true : false,
        },
      ];
    case 12:
      return [
        // prospekIndustri
        {
          desc: 'Kondisi makro dimasa depan memberikan pengaruh negative terhadap prospek industri yang digeluti debitur sehingga memberikan dampak lebih buruk dari periode sebelumnya.',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Kondisi makro dimasa depan stabil dan mempertahankan prospek indsutri yang digeluti debitur sama dengan periode sebelumnya yang masih buruk.',
          result: result == 2 ? true : false,
        },
        {
          desc: 'Kondisi makro dimasa depan lebih baik dari periode sebelumnya namun tidak memberikan dampak positif bagi industri yang digeluti debitur.',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Kondisi makro dimasa depan lebih baik dari periode sebelumnya dan memberikan dampak positif bagi industri yang digeluti debitur.',
          result: result == 4 ? true : false,
        },
      ];
    case 13:
      return [
        // coverageAgunan
        {
          desc: 'Agunan mengcover ≤ 50%',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Agunan mengcover > 50% s/d 80%',
          result: result == 2 ? true : false,
        },
        {
          desc: 'Agunan mengcover > 80% s/d 100%',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Agunan mengcover > 100%',
          result: result == 4 ? true : false,
        },
      ];
    case 14:
      return [
        // coverageAgunan
        {
          desc: 'Agunan Atas nama anggota keluarga lain atau keluarga dekat pemegang saham, afiliasi',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Agunan Atas nama ipar/mertua/pengurus non pemegang saham',
          result: result == 2 ? true : false,
        },
        {
          desc: 'Agunan Atas nama pasangan debitur (suami/istri/orang tua/anak/kakak/adik) atau pemegang saham minoritas',
          result: result == 3 ? true : false,
        },
        {
          desc: 'Agunan Atas nama debitur sendiri atau pemegang saham mayoritas',
          result: result == 4 ? true : false,
        },
      ];
    case 15:
      return [
        // marketabiitasAgunan
        {
          desc: 'Agunan tidak marketable',
          result: result == 1 ? true : false,
        },
        {
          desc: 'Agunan marketable',
          result: result == 4 ? true : false,
        },
      ];
    default:
      return '';
  }
};

const numToSSColumn = (num) => {
  let s = '',
    t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = ((num - t) / 26) | 0;
  }
  return s || undefined;
};

const fieldIsEmpty = async (record, roles) => {
  let result = { emptyRows: null };
  for (let i in record) {
    let data = record[i];
    let rowNumber = parseInt(i) + 2;
    roles.forEach((el, idx) => {
      if (data[idx] === undefined || data[idx] === ' ' || data[idx] === '') {
        let columnAlpha = numToSSColumn(el + 1); // +1   bcs array start with 0
        result.emptyRows = `row: ${rowNumber}, column: ${columnAlpha} can't be empty`;
      }
    });
  }
  return result;
};

const fieldValidate = async (record, typeData) => {
  // let typeRows = [];
  let result = { typeRows: null };
  for (const key in record) {
    let data = record[key];
    let rowNumber = parseInt(key) + 2;
    typeData.forEach((el, idx) => {
      if (typeof data[idx] != el) {
        let columnAlpha = numToSSColumn(idx + 2);
        result.typeRows = `row: ${rowNumber}, column: ${columnAlpha} must be ${el}`;
      }
    });
  }
  return result;
};

const convertDate = (d) => {
  let date = new Date(d),
    day = '' + date.getUTCDate(),
    month = '' + (date.getUTCMonth() + 1),
    year = '' + date.getUTCFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [day, month, year].join('/');
};

const roleTableNm = (val) => {
  switch (val) {
    case 'adk':
      return 'verify_adk';
    case 'cbl':
      return 'verify_cbl';
    case 'pemutus':
      return 'verify_pemutus_pusat';
    default:
      return '';
  }
};

const multipleRows = async (rowCount, columnCount, startAt = 1) => {
  let index = startAt;
  return Array(rowCount)
    .fill(0)
    .map(
      (v) =>
        `(${Array(columnCount)
          .fill(0)
          .map((v) => `$${index++}`)
          .join(', ')})`
    )
    .join(', ');
};

const multipleValues = async (arr) => {
  const newArr = [];
  arr.forEach((v) => v.forEach((p) => newArr.push(p)));
  return newArr;
};

const statusPencairan = (val, numDay = 0) => {
  switch (val) {
    case 0:
      return { status: 'Belum ada Pencairan', level: 1, alias: 0 };
    case 1:
      return { status: 'Aktif', level: 6, alias: 0 };
    case 2:
      return { status: 'Approval CBL', level: 3, alias: 4 };
    case 3:
      return { status: 'Verifikasi ADK', level: 4, alias: 1 };
    case 4:
      return { status: `H${numDay} Jatuh Tempo`, level: 7, alias: 0 };
    case 5:
      return { status: 'Jatuh Tempo', level: 8, alias: 0 };
    case 6:
      return { status: `Telat ${numDay} Hari`, level: 9, alias: 0 };
    case 7:
      return { status: 'Lunas', level: 0, alias: 0 };
    case 8:
      return { status: 'Ditolak', level: 0, alias: 3 };
    case 9:
      return { status: 'Harus Revisi', level: 5, alias: 2 };
    case 10:
      return { status: 'Pengajuan', level: 2, alias: 0 };
    case 11:
      return { status: 'Konfirmasi CBL', level: 0, alias: 1 };
    default:
      return { status: '', level: 0, alias: 0 };
  }
};

const getInitial = (text, codeTable) => {
  text = text.replace(/\s+/g, ' ').trim().split(' ');
  let initial = '';
  if (codeTable == 1 || codeTable == 4) {
    if (text.length > 1)
      initial = text[0][0].toUpperCase() + text[1][0].toUpperCase();
    if (text.length <= 1) initial = text[0][0].toUpperCase();
  }
  if (codeTable == 2 || codeTable == 3) {
    if (text.length > 2)
      initial = text[1][0].toUpperCase() + text[2][0].toUpperCase();
    else if (text.length == 2) initial = text[1][0].toUpperCase();
    else initial = text[0][0].toUpperCase();
  }
  return initial;
};

const formatTerbilang = (value) => {
  const numbers = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];

  if (value < 12) {
    return numbers[value];
  } else if (value < 20) {
    return formatTerbilang(value - 10) + ' belas';
  } else if (value < 100) {
    return (
      formatTerbilang(Math.floor(parseInt(value) / 10)) +
      ' puluh ' +
      formatTerbilang(parseInt(value) % 10)
    );
  } else if (value < 200) {
    return 'seratus ' + formatTerbilang(parseInt(value) - 100);
  } else if (value < 1000) {
    return (
      formatTerbilang(Math.floor(parseInt(value) / 100)) +
      ' ratus ' +
      formatTerbilang(parseInt(value) % 100)
    );
  } else if (value < 2000) {
    return 'seribu ' + formatTerbilang(parseInt(value) - 1000);
  } else if (value < 1000000) {
    return (
      formatTerbilang(Math.floor(parseInt(value) / 1000)) +
      ' ribu ' +
      formatTerbilang(parseInt(value) % 1000)
    );
  } else if (value < 1000000000) {
    return (
      formatTerbilang(Math.floor(parseInt(value) / 1000000)) +
      ' juta ' +
      formatTerbilang(parseInt(value) % 1000000)
    );
  } else if (value < 1000000000000) {
    return (
      formatTerbilang(Math.floor(parseInt(value) / 1000000000)) +
      ' milyar ' +
      formatTerbilang(parseInt(value) % 1000000000)
    );
  }
};

const tradeCheckingExcelParse = async (file_, type) => {
  const sendResponse = [];
  let idx = null;
  if (type.toLowerCase() === 'supplier') idx = 0;
  else if (type.toLowerCase() === 'buyer') idx = 1;
  if (idx === null) return wrapper.error('Data type must be supplier or buyer');
  if (!file_) return wrapper.error('File is empty');

  const workSheetsFromFile = xlsx.parse(file_);
  let dataTradeChecking = workSheetsFromFile;
  const dataType = ['supplier', 'buyer'];
  const templateTradeChecking = [
    ['no', 'namasupplier', 'alamatsupplier', 'no.handphone', 'lamabekerjasama'],
    ['no', 'namabuyer', 'alamatbuyer', 'no.handphone', 'lamabekerjasama'],
  ];

  if (dataTradeChecking.length < 2) {
    fs.unlinkSync(file_);
    return wrapper.error('Number of sheet is less than 2');
  }
  dataTradeChecking.splice(2);

  if (dataTradeChecking[idx].data.length < 1) {
    fs.unlinkSync(file_);
    return wrapper.error(`Data trade checking ${dataType[idx]} can't be empty`);
  }

  if (dataTradeChecking[idx].name.toLowerCase() != dataType[idx]) {
    fs.unlinkSync(file_);
    return wrapper.error(
      `Invalid sheet ${idx + 1} name - must be ${dataType[idx]}`
    );
  }

  let dataField = dataTradeChecking[idx].data[0].map((el) => {
    let _el = el.split(' ', 2).join(' ');
    return _el.toLowerCase().replace(/\s+/g, '');
  });

  if (await checkField(templateTradeChecking[idx], dataField)) {
    fs.unlinkSync(file_);
    return wrapper.error(`Invalid ${dataType[idx]} template file`);
  }

  //delete field name
  dataTradeChecking[idx] = dataTradeChecking[idx].data.slice(1);
  //delete array length == 0
  dataTradeChecking[idx] = dataTradeChecking[idx].filter((e) => {
    return e.length != 0;
  });

  //delete value No. & remove additional value
  for (const key in dataTradeChecking[idx]) {
    dataTradeChecking[idx][key].splice(0, 1);
    dataTradeChecking[idx][key].splice(4);
  }

  //checkEmpty
  let notEmptySummary = [0, 1, 2, 3];
  const checkEmpty = await fieldIsEmpty(
    dataTradeChecking[idx],
    notEmptySummary
  );
  if (checkEmpty.emptyRows) {
    fs.unlinkSync(file_);
    return wrapper.error(
      `Data trade checking ${dataType[idx]} is not complete`
    );
  }

  //validation
  let typeDataTradeChecking = ['string', 'string', 'string', 'string'];
  const checkValidate = await fieldValidate(
    dataTradeChecking[idx],
    typeDataTradeChecking
  );
  if (checkValidate.typeRows) {
    fs.unlinkSync(file_);
    return wrapper.error(checkValidate.typeRows);
  }

  for (let j = 0; j < dataTradeChecking[idx].length; j++) {
    dataTradeChecking[idx][j].push(dataType[idx]);
    sendResponse.push(dataTradeChecking[idx][j]);
  }

  return wrapper.data(sendResponse);
};

const virusesMapping = async (payload) => {
  const {
    s1,
    s2,
    s3,
    s4,
    s5,
    s6,
    s7,
    s8,
    s9,
    s10,
    s11,
    s12,
    s13,
    s14,
    s15,
    s16,
    s17,
    s18,
    s19,
    s20,
    s21,
  } = payload;

  if (
    s8 === 'true' &&
    s14 === 'true' &&
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s2 === 'true' || s17 === 'true') &&
    (s4 === 'true' || s7 === 'true') &&
    (s15 === 'true' || s16 === 'true') &&
    s5 === 'true' &&
    s13 === 'true' &&
    s3 === 'true' &&
    (s9 || s10)
  ) {
    let res = [
      8,
      14,
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      5,
      13,
      3,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 1,
    };
  }

  if (
    (s2 === 'true' || s17 === 'true') &&
    (s15 === 'true' || s16 === 'true') &&
    (s11 === 'true' || s12 === 'true') &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      s15 === 'true' ? 15 : 0,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 2,
    };
  }

  if (
    s8 === 'true' &&
    (s11 === 'true' || s12 === 'true') &&
    s18 === 'true' &&
    s6 === 'true' &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      8,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      18,
      6,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 3,
    };
  }

  if (
    s8 === 'true' &&
    (s4 === 'true' || s7 === 'true') &&
    (s11 === 'true' || s12 === 'true') &&
    s17 === 'true' &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      8,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      17,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 4,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s2 === 'true' || s17 === 'true') &&
    s3 === 'true' &&
    (s15 === 'true' || s16 === 'true') &&
    s6 === 'true' &&
    (s4 === 'true' || s7 === 'true') &&
    (s9 === 'true' || s10 === 'true') &&
    s8 === 'true' &&
    (s11 === 'true' || s12 === 'true') &&
    s5 === 'true' &&
    s13 === 'true'
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      3,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      6,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
      8,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      5,
      13,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 5,
    };
  }

  if (
    (s11 === 'true' || s12 === 'true') &&
    (s15 === 'true' || s16 === 'true') &&
    (s4 === 'true' || s7 === 'true') &&
    s6 === 'true' &&
    (s9 === 'true' || s10 === 'true') &&
    s8 === 'true' &&
    s5 === 'true' &&
    s13 === 'true'
  ) {
    let res = [
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      6,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
      8,
      5,
      13,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 6,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s2 === 'true' || s17 === 'true') &&
    s8 === 'true' &&
    (s9 === 'true' || s10 === 'true') &&
    s3 === 'true' &&
    s18 === 'true' &&
    (s4 === 'true' || s7 === 'true') &&
    (s15 === 'true' || s16 === 'true') &&
    s5 === 'true' &&
    s6 === 'true'
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      8,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
      3,
      18,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      5,
      6,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 7,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s9 === 'true' || s10 === 'true') &&
    (s4 === 'true' || s7 === 'true') &&
    (s2 === 'true' || s17 === 'true') &&
    s8 === 'true' &&
    s13 === 'true'
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      8,
      13,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 8,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s4 === 'true' || s7 === 'true') &&
    s8 === 'true' &&
    (s2 === 'true' || s17 === 'true') &&
    (s11 === 'true' || s12 === 'true') &&
    s13 === 'true' &&
    s5 === 'true' &&
    s6 === 'true' &&
    s19 === 'true' &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s4 === 'true' ? 4 : 0,
      s7 === 'true' ? 7 : 0,
      8,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      13,
      5,
      6,
      19,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 9,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    s17 === 'true' &&
    s14 === 'true' &&
    (s15 === 'true' || s16 === 'true') &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      17,
      14,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 10,
    };
  }

  if (
    (s1 === 'true' || s20 === 'true' || s21 === 'true') &&
    (s2 === 'true' || s17 === 'true') &&
    (s9 === 'true' || s10 === 'true')
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
      s2 === 'true' ? 2 : 0,
      s17 === 'true' ? 17 : 0,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 11,
    };
  }

  if (
    s1 === 'true' ||
    s2 === 'true' ||
    s3 === 'true' ||
    s4 === 'true' ||
    s5 === 'true' ||
    s6 === 'true' ||
    s7 === 'true' ||
    s8 === 'true' ||
    s9 === 'true' ||
    s10 === 'true' ||
    s11 === 'true' ||
    s12 === 'true' ||
    s13 === 'true' ||
    s14 === 'true' ||
    s15 === 'true' ||
    s16 === 'true' ||
    s17 === 'true' ||
    s18 === 'true' ||
    s19 === 'true' ||
    s20 === 'true' ||
    s21 === 'true'
  ) {
    let res = [
      s1 === 'true' ? 1 : 0,
      s2 === 'true' ? 2 : 0,
      s3 === 'true' ? 3 : 0,
      s4 === 'true' ? 4 : 0,
      s5 === 'true' ? 5 : 0,
      s6 === 'true' ? 6 : 0,
      s7 === 'true' ? 7 : 0,
      s8 === 'true' ? 8 : 0,
      s9 === 'true' ? 9 : 0,
      s10 === 'true' ? 10 : 0,
      s11 === 'true' ? 11 : 0,
      s12 === 'true' ? 12 : 0,
      s13 === 'true' ? 13 : 0,
      s14 === 'true' ? 14 : 0,
      s15 === 'true' ? 15 : 0,
      s16 === 'true' ? 16 : 0,
      s17 === 'true' ? 17 : 0,
      s18 === 'true' ? 18 : 0,
      s19 === 'true' ? 19 : 0,
      s20 === 'true' ? 20 : 0,
      s21 === 'true' ? 21 : 0,
    ];

    return {
      symptoms: await filterZero(res),
      virus: 0,
    };
  }
};

const filterZero = async (res) => {
  return res.filter((s) => s !== 0);
};

module.exports = {
  stringValid,
  statusPipeline,
  pipelineType,
  dateValid,
  lpgStatus,
  statusIndividualDHN,
  statusIndividualDukcapil,
  dateFormatID,
  screeningResponseFinal,
  dateFormatDukcapil,
  statusPrakarsa,
  statusAgunanPokok,
  dateFormatSlik,
  statusDashboardADK,
  jenisAgunanPokok,
  jenisAgunanTambahan,
  base64Encode,
  statusInfoPrakarsaHeader,
  checkField,
  calculation,
  descriptionNonFinance,
  fieldIsEmpty,
  fieldValidate,
  roleTableNm,
  multipleRows,
  multipleValues,
  statusPencairan,
  formatTerbilang,
  getInitial,
  encodeBase64,
  decodeBase64,
  numberFormat,
  convertDate,
  tradeCheckingExcelParse,
  virusesMapping,
};
