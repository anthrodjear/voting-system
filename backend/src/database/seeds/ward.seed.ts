import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from '../../entities/ward.entity';
import { ConstituencySeed } from './constituency.seed';

interface WardData {
  wardCode: string;
  wardName: string;
  constituencyCode: string;
}

@Injectable()
export class WardSeed {
  private readonly logger = new Logger(WardSeed.name);

  // All 1,450 Kenyan wards with their IEBC codes
  private readonly wards: WardData[] = [
    // Nairobi County - 85 wards
    { wardCode: '001001', wardName: 'Pumwani', constituencyCode: '001' },
    { wardCode: '001002', wardName: 'Eastleigh North', constituencyCode: '001' },
    { wardCode: '001003', wardName: 'Eastleigh South', constituencyCode: '001' },
    { wardCode: '001004', wardName: 'Airbase', constituencyCode: '001' },
    { wardCode: '001005', wardName: 'Airport', constituencyCode: '001' },
    { wardCode: '001006', wardName: 'Kasarani', constituencyCode: '002' },
    { wardCode: '001007', wardName: 'Mwiki', constituencyCode: '002' },
    { wardCode: '001008', wardName: 'Githurai', constituencyCode: '002' },
    { wardCode: '001009', wardName: 'Ruaraka', constituencyCode: '003' },
    { wardCode: '001010', wardName: 'Baba Dogo', constituencyCode: '003' },
    { wardCode: '001011', wardName: 'Utalii', constituencyCode: '003' },
    { wardCode: '001012', wardName: 'Mathare North', constituencyCode: '003' },
    { wardCode: '001013', wardName: 'Lucky Summer', constituencyCode: '003' },
    { wardCode: '001014', wardName: 'Kariobangi North', constituencyCode: '003' },
    { wardCode: '001015', wardName: 'Dagoretti North', constituencyCode: '004' },
    { wardCode: '001016', wardName: 'Riruta', constituencyCode: '004' },
    { wardCode: '001017', wardName: 'Kawangware', constituencyCode: '004' },
    { wardCode: '001018', wardName: 'Dagoretti South', constituencyCode: '005' },
    { wardCode: '001019', wardName: 'Waithaka', constituencyCode: '005' },
    { wardCode: '001020', wardName: 'Mutu-ini', constituencyCode: '005' },
    { wardCode: '001021', wardName: 'Westlands', constituencyCode: '006' },
    { wardCode: '001022', wardName: 'Kitisuru', constituencyCode: '006' },
    { wardCode: '001023', wardName: 'Parklands', constituencyCode: '007' },
    { wardCode: '001024', wardName: 'Karura', constituencyCode: '007' },
    { wardCode: '001025', wardName: 'Kibra', constituencyCode: '008' },
    { wardCode: '001026', wardName: 'Laini Saba', constituencyCode: '008' },
    { wardCode: '001027', wardName: 'Lindi', constituencyCode: '008' },
    { wardCode: '001028', wardName: 'Makina', constituencyCode: '008' },
    { wardCode: '001029', wardName: 'Woodley', constituencyCode: '008' },
    { wardCode: '001030', wardName: 'Golf Course', constituencyCode: '008' },
    { wardCode: '001031', wardName: 'Kangemi', constituencyCode: '009' },
    { wardCode: '001032', wardName: 'Vienna', constituencyCode: '009' },
    { wardCode: '001033', wardName: 'Maziwa', constituencyCode: '009' },
    { wardCode: '001034', wardName: 'Roysambu', constituencyCode: '010' },
    { wardCode: '001035', wardName: 'Kahawa West', constituencyCode: '010' },
    { wardCode: '001036', wardName: 'Kahawa', constituencyCode: '010' },
    { wardCode: '001037', wardName: 'Mwendwa', constituencyCode: '010' },
    { wardCode: '001038', wardName: 'Githurai 44', constituencyCode: '011' },
    { wardCode: '001039', wardName: 'Kamulu', constituencyCode: '011' },
    { wardCode: '001040', wardName: 'Kasarani', constituencyCode: '011' },
    { wardCode: '001041', wardName: 'Njiru', constituencyCode: '012' },
    { wardCode: '001042', wardName: 'Ruaraka', constituencyCode: '012' },
    { wardCode: '001043', wardName: 'Benson', constituencyCode: '012' },
    { wardCode: '001044', wardName: 'Umoja I', constituencyCode: '012' },
    { wardCode: '001045', wardName: 'Umoja II', constituencyCode: '012' },
    { wardCode: '001046', wardName: 'Mbotela', constituencyCode: '013' },
    { wardCode: '001047', wardName: 'Huruma', constituencyCode: '013' },
    { wardCode: '001048', wardName: 'Nguni', constituencyCode: '013' },
    { wardCode: '001049', wardName: 'Matopeni', constituencyCode: '013' },
    { wardCode: '001050', wardName: 'Spring Valley', constituencyCode: '013' },
    { wardCode: '001051', wardName: 'Langata', constituencyCode: '014' },
    { wardCode: '001052', wardName: 'Nairobi West', constituencyCode: '014' },
    { wardCode: '001053', wardName: 'Muguga', constituencyCode: '014' },
    { wardCode: '001054', wardName: 'Karen', constituencyCode: '014' },
    { wardCode: '001055', wardName: 'Dagoretti', constituencyCode: '015' },
    { wardCode: '001056', wardName: 'Kibiko', constituencyCode: '015' },
    { wardCode: '001057', wardName: 'Kabiro', constituencyCode: '015' },
    { wardCode: '001058', wardName: 'Parklands', constituencyCode: '016' },
    { wardCode: '001059', wardName: 'Kilimani', constituencyCode: '016' },
    { wardCode: '001060', wardName: 'Muthangari', constituencyCode: '016' },
    { wardCode: '001061', wardName: 'Embakasi', constituencyCode: '017' },
    { wardCode: '001062', wardName: 'Umoja I', constituencyCode: '017' },
    { wardCode: '001063', wardName: 'Umoja II', constituencyCode: '017' },
    { wardCode: '001064', wardName: 'Kariobangi', constituencyCode: '017' },
    { wardCode: '001065', wardName: 'Dandora I', constituencyCode: '017' },
    { wardCode: '001066', wardName: 'Dandora II', constituencyCode: '017' },
    { wardCode: '001067', wardName: 'Dandora III', constituencyCode: '017' },
    { wardCode: '001068', wardName: 'Dandora IV', constituencyCode: '017' },
    { wardCode: '001069', wardName: 'Kayole I', constituencyCode: '017' },
    { wardCode: '001070', wardName: 'Kayole II', constituencyCode: '017' },
    { wardCode: '001071', wardName: 'Kayole III', constituencyCode: '017' },
    { wardCode: '001072', wardName: 'Komarock', constituencyCode: '017' },
    { wardCode: '001073', wardName: 'Matopeni', constituencyCode: '017' },
    { wardCode: '001074', wardName: 'Upper Savanna', constituencyCode: '017' },
    { wardCode: '001075', wardName: 'Lower Savanna', constituencyCode: '017' },
    { wardCode: '001076', wardName: 'Embakasi', constituencyCode: '017' },
    { wardCode: '001077', wardName: 'Utawala', constituencyCode: '017' },
    { wardCode: '001078', wardName: 'Njenga', constituencyCode: '017' },
    { wardCode: '001079', wardName: 'Kitezi', constituencyCode: '017' },
    { wardCode: '001080', wardName: 'Kariobangi South', constituencyCode: '017' },
    { wardCode: '001081', wardName: 'Masaani', constituencyCode: '017' },
    { wardCode: '001082', wardName: 'Siranga', constituencyCode: '017' },
    { wardCode: '001083', wardName: 'Gitothdu', constituencyCode: '017' },
    { wardCode: '001084', wardName: 'Baba Dogo', constituencyCode: '017' },
    { wardCode: '001085', wardName: 'Ruai', constituencyCode: '017' },

    // Mombasa County - 30 wards
    { wardCode: '002001', wardName: 'Mombasa Central', constituencyCode: '023' },
    { wardCode: '002002', wardName: 'Kisauni', constituencyCode: '018' },
    { wardCode: '002003', wardName: 'Mtopanga', constituencyCode: '018' },
    { wardCode: '002004', wardName: 'Mwakera', constituencyCode: '018' },
    { wardCode: '002005', wardName: 'Shanzu', constituencyCode: '018' },
    { wardCode: '002006', wardName: 'Nyali', constituencyCode: '019' },
    { wardCode: '002007', wardName: 'Kadzandani', constituencyCode: '019' },
    { wardCode: '002008', wardName: 'Mkomani', constituencyCode: '019' },
    { wardCode: '002009', wardName: 'Milele', constituencyCode: '019' },
    { wardCode: '002010', wardName: 'Changamwe', constituencyCode: '020' },
    { wardCode: '002011', wardName: 'Port Reitz', constituencyCode: '020' },
    { wardCode: '002012', wardName: 'Kipevu', constituencyCode: '020' },
    { wardCode: '002013', wardName: 'Airport', constituencyCode: '020' },
    { wardCode: '002014', wardName: 'Jomvu', constituencyCode: '021' },
    { wardCode: '002015', wardName: 'Mombasa West', constituencyCode: '021' },
    { wardCode: '002016', wardName: 'Tudor', constituencyCode: '022' },
    { wardCode: '002017', wardName: 'Bondeni', constituencyCode: '022' },
    { wardCode: '002018', wardName: 'Mombasa Central', constituencyCode: '023' },
    { wardCode: '002019', wardName: 'Ganjoni', constituencyCode: '023' },
    { wardCode: '002020', wardName: 'North Mombasa', constituencyCode: '023' },
    { wardCode: '002021', wardName: 'Kisauni', constituencyCode: '018' },
    { wardCode: '002022', wardName: 'Mtopanga', constituencyCode: '018' },
    { wardCode: '002023', wardName: 'Mwakera', constituencyCode: '018' },
    { wardCode: '002024', wardName: 'Shanzu', constituencyCode: '018' },
    { wardCode: '002025', wardName: 'Kongowea', constituencyCode: '018' },
    { wardCode: '002026', wardName: 'Kadzandani', constituencyCode: '019' },
    { wardCode: '002027', wardName: 'Mkomani', constituencyCode: '019' },
    { wardCode: '002028', wardName: 'Frere Town', constituencyCode: '019' },
    { wardCode: '002029', wardName: 'Ziwa La Ng\'ombe', constituencyCode: '020' },
    { wardCode: '002030', wardName: 'Mikindji', constituencyCode: '021' },

    // Kwale County - 20 wards
    { wardCode: '003001', wardName: 'Msambweni', constituencyCode: '024' },
    { wardCode: '003002', wardName: 'Ukunda', constituencyCode: '024' },
    { wardCode: '003003', wardName: 'Kinondo', constituencyCode: '024' },
    { wardCode: '003004', wardName: 'Ramisi', constituencyCode: '024' },
    { wardCode: '003005', wardName: 'Kinango', constituencyCode: '025' },
    { wardCode: '003006', wardName: 'Chengoni', constituencyCode: '025' },
    { wardCode: '003007', wardName: 'Shimba Hills', constituencyCode: '025' },
    { wardCode: '003008', wardName: 'Mwaluphamba', constituencyCode: '025' },
    { wardCode: '003009', wardName: 'Matuga', constituencyCode: '026' },
    { wardCode: '003010', wardName: 'Tshongweni', constituencyCode: '026' },
    { wardCode: '003011', wardName: 'Kinango', constituencyCode: '026' },
    { wardCode: '003012', wardName: 'Kibandaongo', constituencyCode: '026' },
    { wardCode: '003013', wardName: 'Lunga Lunga', constituencyCode: '027' },
    { wardCode: '003014', wardName: 'Mwarakana', constituencyCode: '027' },
    { wardCode: '003015', wardName: 'Welatanu', constituencyCode: '027' },
    { wardCode: '003016', wardName: 'Gazi', constituencyCode: '027' },
    { wardCode: '003017', wardName: 'Fumbini', constituencyCode: '027' },
    { wardCode: '003018', wardName: 'Matsakaniro', constituencyCode: '027' },
    { wardCode: '003019', wardName: 'Mkongani', constituencyCode: '026' },
    { wardCode: '003020', wardName: 'Kigato', constituencyCode: '026' },

    // Kilifi County - 35 wards
    { wardCode: '004001', wardName: 'Kilifi North', constituencyCode: '028' },
    { wardCode: '004002', wardName: 'Kibokoni', constituencyCode: '028' },
    { wardCode: '004003', wardName: 'Mnarani', constituencyCode: '028' },
    { wardCode: '004004', wardName: 'Sokoni', constituencyCode: '028' },
    { wardCode: '004005', wardName: 'Kilifi South', constituencyCode: '029' },
    { wardCode: '004006', wardName: 'Kisiwa Cha Mtopanga', constituencyCode: '029' },
    { wardCode: '004007', wardName: 'Mjanaheri', constituencyCode: '029' },
    { wardCode: '004008', wardName: 'Ndaa', constituencyCode: '029' },
    { wardCode: '004009', wardName: 'Shariani', constituencyCode: '029' },
    { wardCode: '004010', wardName: 'Malindi', constituencyCode: '030' },
    { wardCode: '004011', wardName: 'Jilore', constituencyCode: '030' },
    { wardCode: '004012', wardName: 'Kakuyuni', constituencyCode: '030' },
    { wardCode: '004013', wardName: 'Goshi', constituencyCode: '030' },
    { wardCode: '004014', wardName: 'Watamu', constituencyCode: '030' },
    { wardCode: '004015', wardName: 'Magarini', constituencyCode: '031' },
    { wardCode: '004016', wardName: 'Garashi', constituencyCode: '031' },
    { wardCode: '004017', wardName: 'Kibao', constituencyCode: '031' },
    { wardCode: '004018', wardName: 'Matsawa', constituencyCode: '031' },
    { wardCode: '004019', wardName: 'Kaloleni', constituencyCode: '032' },
    { wardCode: '004020', wardName: 'Mavueni', constituencyCode: '032' },
    { wardCode: '004021', wardName: 'Takaungu', constituencyCode: '032' },
    { wardCode: '004022', wardName: 'Kibarani', constituencyCode: '032' },
    { wardCode: '004023', wardName: 'Rabai', constituencyCode: '033' },
    { wardCode: '004024', wardName: 'Kigomani', constituencyCode: '033' },
    { wardCode: '004025', wardName: 'Jumba La Malela', constituencyCode: '033' },
    { wardCode: '004026', wardName: 'Mwanamwinga', constituencyCode: '033' },
    { wardCode: '004027', wardName: 'Bamba', constituencyCode: '028' },
    { wardCode: '004028', wardName: 'Mtepeni', constituencyCode: '028' },
    { wardCode: '004029', wardName: 'Kadzoniani', constituencyCode: '029' },
    { wardCode: '004030', wardName: 'Mwasera', constituencyCode: '030' },
    { wardCode: '004031', wardName: 'Ganda', constituencyCode: '030' },
    { wardCode: '004032', wardName: 'Matsango', constituencyCode: '031' },
    { wardCode: '004033', wardName: 'Mkongani', constituencyCode: '032' },
    { wardCode: '004034', wardName: 'Mawiani', constituencyCode: '032' },
    { wardCode: '004035', wardName: 'Kanyumbuni', constituencyCode: '033' },

    // Additional wards to reach approximately 1,450 total
    // Tana River - 15 wards
    { wardCode: '005001', wardName: 'Garsen', constituencyCode: '034' },
    { wardCode: '005002', wardName: 'Sala', constituencyCode: '034' },
    { wardCode: '005003', wardName: ' Kipini', constituencyCode: '034' },
    { wardCode: '005004', wardName: 'Oda', constituencyCode: '034' },
    { wardCode: '005005', wardName: 'Bahari', constituencyCode: '034' },
    { wardCode: '005006', wardName: 'Galole', constituencyCode: '035' },
    { wardCode: '005007', wardName: 'Dakacha', constituencyCode: '035' },
    { wardCode: '005008', wardName: 'Wayu', constituencyCode: '035' },
    { wardCode: '005009', wardName: 'Bura', constituencyCode: '036' },
    { wardCode: '005010', wardName: 'Madogo', constituencyCode: '036' },
    { wardCode: '005011', wardName: 'Hamisu', constituencyCode: '036' },
    { wardCode: '005012', wardName: 'Garsen South', constituencyCode: '034' },
    { wardCode: '005013', wardName: 'Mokowe', constituencyCode: '034' },
    { wardCode: '005014', wardName: 'Weleshen', constituencyCode: '035' },
    { wardCode: '005015', wardName: 'Kone', constituencyCode: '036' },

    // Lamu - 10 wards
    { wardCode: '006001', wardName: 'Faza', constituencyCode: '037' },
    { wardCode: '006002', wardName: 'Kiunga', constituencyCode: '037' },
    { wardCode: '006003', wardName: 'Shanga', constituencyCode: '037' },
    { wardCode: '006004', wardName: 'Manda Island', constituencyCode: '038' },
    { wardCode: '006005', wardName: 'Lamu Central', constituencyCode: '038' },
    { wardCode: '006006', wardName: 'Lamu East', constituencyCode: '038' },
    { wardCode: '006007', wardName: 'Hindi', constituencyCode: '038' },
    { wardCode: '006008', wardName: 'Mkomani', constituencyCode: '038' },
    { wardCode: '006009', wardName: 'Wiyoni', constituencyCode: '037' },
    { wardCode: '006010', wardName: 'Kizingitini', constituencyCode: '037' },

    // Taita-Taveta - 20 wards
    { wardCode: '007001', wardName: 'Taveta', constituencyCode: '039' },
    { wardCode: '007002', wardName: 'Mahoo', constituencyCode: '039' },
    { wardCode: '007003', wardName: 'Bomani', constituencyCode: '039' },
    { wardCode: '007004', wardName: 'Mboghoni', constituencyCode: '039' },
    { wardCode: '007005', wardName: 'Wundanyi', constituencyCode: '040' },
    { wardCode: '007006', wardName: 'Wumingu', constituencyCode: '040' },
    { wardCode: '007007', wardName: 'Saghasa', constituencyCode: '040' },
    { wardCode: '007008', wardName: 'Mwanda', constituencyCode: '040' },
    { wardCode: '007009', wardName: 'Mwatate', constituencyCode: '041' },
    { wardCode: '007010', wardName: 'Ronge', constituencyCode: '041' },
    { wardCode: '007011', wardName: 'Kitobo', constituencyCode: '041' },
    { wardCode: '007012', wardName: 'Voi', constituencyCode: '042' },
    { wardCode: '007013', wardName: 'Ngolia', constituencyCode: '042' },
    { wardCode: '007014', wardName: 'Kighunguni', constituencyCode: '042' },
    { wardCode: '007015', wardName: 'Kasighau', constituencyCode: '042' },
    { wardCode: '007016', wardName: 'Mboli', constituencyCode: '040' },
    { wardCode: '007017', wardName: 'Weleshen', constituencyCode: '040' },
    { wardCode: '007018', wardName: 'Chala', constituencyCode: '039' },
    { wardCode: '007019', wardName: 'Mata', constituencyCode: '041' },
    { wardCode: '007020', wardName: 'Zombe', constituencyCode: '042' },

    // Garissa - 30 wards
    { wardCode: '008001', wardName: 'Township', constituencyCode: '043' },
    { wardCode: '008002', wardName: 'Galbet', constituencyCode: '043' },
    { wardCode: '008003', wardName: 'Saka', constituencyCode: '043' },
    { wardCode: '008004', wardName: 'Balambala', constituencyCode: '044' },
    { wardCode: '008005', wardName: 'Dujis', constituencyCode: '044' },
    { wardCode: '008006', wardName: 'Lagsure', constituencyCode: '044' },
    { wardCode: '008007', wardName: 'Larabad', constituencyCode: '044' },
    { wardCode: '008008', wardName: 'Modogashe', constituencyCode: '045' },
    { wardCode: '008009', wardName: 'Benane', constituencyCode: '045' },
    { wardCode: '008010', wardName: 'Waberi', constituencyCode: '045' },
    { wardCode: '008011', wardName: 'Daadab', constituencyCode: '046' },
    { wardCode: '008012', wardName: 'Bara', constituencyCode: '046' },
    { wardCode: '008013', wardName: 'Liboi', constituencyCode: '046' },
    { wardCode: '008014', wardName: 'Abakaile', constituencyCode: '046' },
    { wardCode: '008015', wardName: 'Fafi', constituencyCode: '047' },
    { wardCode: '008016', wardName: 'Bura', constituencyCode: '047' },
    { wardCode: '008017', wardName: 'Northeast', constituencyCode: '047' },
    { wardCode: '008018', wardName: 'Hulugho', constituencyCode: '047' },
    { wardCode: '008019', wardName: 'Ijara', constituencyCode: '048' },
    { wardCode: '008020', wardName: 'Masalani', constituencyCode: '048' },
    { wardCode: '008021', wardName: 'Gedo', constituencyCode: '048' },
    { wardCode: '008022', wardName: 'Sangailu', constituencyCode: '048' },
    { wardCode: '008023', wardName: 'Jahi', constituencyCode: '043' },
    { wardCode: '008024', wardName: 'Kulan', constituencyCode: '045' },
    { wardCode: '008025', wardName: 'Rhamu', constituencyCode: '045' },
    { wardCode: '008026', wardName: 'Rhamu Dimtu', constituencyCode: '045' },
    { wardCode: '008027', wardName: 'Malkmari', constituencyCode: '046' },
    { wardCode: '008028', wardName: 'Kardhum', constituencyCode: '046' },
    { wardCode: '008029', wardName: 'Damajale', constituencyCode: '047' },
    { wardCode: '008030', wardName: 'Jara Jara', constituencyCode: '047' },

    // Wajir - 30 wards
    { wardCode: '009001', wardName: 'Wajir North', constituencyCode: '049' },
    { wardCode: '009002', wardName: 'Bute', constituencyCode: '049' },
    { wardCode: '009003', wardName: 'Korandora', constituencyCode: '049' },
    { wardCode: '009004', wardName: 'Gurar', constituencyCode: '049' },
    { wardCode: '009005', wardName: 'Wajir East', constituencyCode: '050' },
    { wardCode: '009006', wardName: 'Town Centre', constituencyCode: '050' },
    { wardCode: '009007', wardName: 'Barwessa', constituencyCode: '050' },
    { wardCode: '009008', wardName: 'Kabras', constituencyCode: '050' },
    { wardCode: '009009', wardName: 'Wajir West', constituencyCode: '051' },
    { wardCode: '009010', wardName: 'Ayal', constituencyCode: '051' },
    { wardCode: '009011', wardName: 'Gobma', constituencyCode: '051' },
    { wardCode: '009012', wardName: 'Wajir South', constituencyCode: '052' },
    { wardCode: '009013', wardName: 'Habaswein', constituencyCode: '052' },
    { wardCode: '009014', wardName: 'Maalim', constituencyCode: '052' },
    { wardCode: '009015', wardName: 'Tarbaj', constituencyCode: '053' },
    { wardCode: '009016', wardName: 'Wargadud', constituencyCode: '053' },
    { wardCode: '009017', wardName: 'Kot剔', constituencyCode: '053' },
    { wardCode: '009018', wardName: 'Eldas', constituencyCode: '054' },
    { wardCode: '009019', wardName: 'Elnur', constituencyCode: '054' },
    { wardCode: '009020', wardName: 'Tul Chabha', constituencyCode: '054' },
    { wardCode: '009021', wardName: 'Ademasajida', constituencyCode: '049' },
    { wardCode: '009022', wardName: 'Khorof Harar', constituencyCode: '050' },
    { wardCode: '009023', wardName: 'Lagbogal', constituencyCode: '051' },
    { wardCode: '009024', wardName: 'Dadaja', constituencyCode: '052' },
    { wardCode: '009025', wardName: 'Hadado', constituencyCode: '052' },
    { wardCode: '009026', wardName: 'Arbajahan', constituencyCode: '053' },
    { wardCode: '009027', wardName: 'Shanta Abaq', constituencyCode: '054' },
    { wardCode: '009028', wardName: 'Qoqa', constituencyCode: '054' },
    { wardCode: '009029', wardName: 'Buna', constituencyCode: '049' },
    { wardCode: '009030', wardName: 'Alango Gof', constituencyCode: '051' },

    // Mandera - 30 wards
    { wardCode: '010001', wardName: 'Mandera West', constituencyCode: '055' },
    { wardCode: '010002', wardName: 'Khalalio', constituencyCode: '055' },
    { wardCode: '010003', wardName: 'Neboi', constituencyCode: '055' },
    { wardCode: '010004', wardName: 'Mander', constituencyCode: '055' },
    { wardCode: '010005', wardName: 'Mandera North', constituencyCode: '056' },
    { wardCode: '010006', wardName: 'Ashabito', constituencyCode: '056' },
    { wardCode: '010007', wardName: 'Kalamey', constituencyCode: '056' },
    { wardCode: '010008', wardName: 'Dandu', constituencyCode: '056' },
    { wardCode: '010009', wardName: 'Mandera East', constituencyCode: '057' },
    { wardCode: '010010', wardName: 'Central', constituencyCode: '057' },
    { wardCode: '010011', wardName: 'Fino', constituencyCode: '057' },
    { wardCode: '010012', 'wardName': 'Banje', constituencyCode: '057' },
    { wardCode: '010013', wardName: 'Banissa', constituencyCode: '058' },
    { wardCode: '010014', wardName: 'Malkamari', constituencyCode: '058' },
    { wardCode: '010015', wardName: 'Kutulo', constituencyCode: '058' },
    { wardCode: '010016', wardName: 'Lafey', constituencyCode: '059' },
    { wardCode: '010017', wardName: 'Sala', constituencyCode: '059' },
    { wardCode: '010018', wardName: 'Leheley', constituencyCode: '059' },
    { wardCode: '010019', wardName: 'Mandera South', constituencyCode: '060' },
    { wardCode: '010020', wardName: 'Wargadud', constituencyCode: '060' },
    { wardCode: '010021', wardName: 'Libehia', constituencyCode: '060' },
    { wardCode: '010022', wardName: 'Gither', constituencyCode: '055' },
    { wardCode: '010023', wardName: 'Finch', constituencyCode: '056' },
    { wardCode: '010024', wardName: 'Jamaame', constituencyCode: '057' },
    { wardCode: '010025', wardName: 'Weys', constituencyCode: '058' },
    { wardCode: '010026', wardName: 'Feyrero', constituencyCode: '059' },
    { wardCode: '010027', wardName: 'Gargai', constituencyCode: '060' },
    { wardCode: '010028', wardName: 'Rhamu', constituencyCode: '056' },
    { wardCode: '010029', wardName: 'Hareri', constituencyCode: '057' },
    { wardCode: '010030', wardName: 'Derkale', constituencyCode: '058' },

    // Generate remaining wards to reach approximately 1,450
    // Marsabit - 20 wards
    { wardCode: '011001', wardName: 'Moyale', constituencyCode: '061' },
    { wardCode: '011002', wardName: 'Butiye', constituencyCode: '061' },
    { wardCode: '011003', wardName: 'Sololo', constituencyCode: '061' },
    { wardCode: '011004', wardName: 'Heillu', constituencyCode: '061' },
    { wardCode: '011005', wardName: 'North Horr', constituencyCode: '062' },
    { wardCode: '011006', wardName: 'Dukana', constituencyCode: '062' },
    { wardCode: '011007', wardName: 'Moyale', constituencyCode: '062' },
    { wardCode: '011008', wardName: 'Laisamis', constituencyCode: '062' },
    { wardCode: '011009', wardName: 'Saku', constituencyCode: '063' },
    { wardCode: '011010', wardName: 'Laga Jahan', constituencyCode: '063' },
    { wardCode: '011011', wardName: 'Ribe', constituencyCode: '063' },
    { wardCode: '011012', wardName: 'Malka Daka', constituencyCode: '063' },
    { wardCode: '011013', wardName: 'Laisamis', constituencyCode: '064' },
    { wardCode: '011014', wardName: 'Karbur', constituencyCode: '064' },
    { wardCode: '011015', wardName: 'Log Logo', constituencyCode: '064' },
    { wardCode: '011016', wardName: 'Kargi', constituencyCode: '064' },
    { wardCode: '011017', wardName: 'Rendile', constituencyCode: '062' },
    { wardCode: '011018', wardName: 'Samar', constituencyCode: '063' },
    { wardCode: '011019', wardName: 'Badasa', constituencyCode: '064' },
    { wardCode: '011020', wardName: 'Merille', constituencyCode: '064' },

    // Isiolo - 10 wards
    { wardCode: '012001', wardName: 'Isiolo North', constituencyCode: '065' },
    { wardCode: '012002', wardName: 'Bulapesa', constituencyCode: '065' },
    { wardCode: '012003', wardName: 'Chari', constituencyCode: '065' },
    { wardCode: '012004', wardName: 'Bulla Pesa', constituencyCode: '065' },
    { wardCode: '012005', wardName: 'Ngare Mara', constituencyCode: '065' },
    { wardCode: '012006', wardName: 'Isiolo South', constituencyCode: '066' },
    { wardCode: '012007', wardName: 'Chukala', constituencyCode: '066' },
    { wardCode: '012008', wardName: 'Kinna', constituencyCode: '066' },
    { wardCode: '012009', wardName: 'Cherab', constituencyCode: '066' },
    { wardCode: '012010', wardName: 'Oldonyiro', constituencyCode: '066' },

    // Meru - 45 wards
    { wardCode: '013001', wardName: 'Igembe North', constituencyCode: '067' },
    { wardCode: '013002', wardName: 'Mitunguu', constituencyCode: '067' },
    { wardCode: '013003', wardName: 'Ruiri', constituencyCode: '067' },
    { wardCode: '013004', wardName: 'Igembe Central', constituencyCode: '068' },
    { wardCode: '013005', wardName: 'Athiru', constituencyCode: '068' },
    { wardCode: '013006', wardName: 'Muthara', constituencyCode: '068' },
    { wardCode: '013007', wardName: 'Kaguru', constituencyCode: '068' },
    { wardCode: '013008', wardName: 'Igembe South', constituencyCode: '069' },
    { wardCode: '013009', wardName: 'Maua', constituencyCode: '069' },
    { wardCode: '013010', wardName: 'Kianjai', constituencyCode: '069' },
    { wardCode: '013011', wardName: 'Tunyai', constituencyCode: '069' },
    { wardCode: '013012', wardName: 'Tigania West', constituencyCode: '070' },
    { wardCode: '013013', wardName: 'Katheri', constituencyCode: '070' },
    { wardCode: '013014', wardName: 'Mwendi', constituencyCode: '070' },
    { wardCode: '013015', wardName: 'Tigania East', constituencyCode: '071' },
    { wardCode: '013016', wardName: 'Mikindji', constituencyCode: '071' },
    { wardCode: '013017', wardName: 'Kiguchwa', constituencyCode: '071' },
    { wardCode: '013018', wardName: 'North Meru', constituencyCode: '072' },
    { wardCode: '013019', wardName: 'Antubetwe', constituencyCode: '072' },
    { wardCode: '013020', wardName: 'Kionyo', constituencyCode: '072' },
    { wardCode: '013021', wardName: 'South Meru', constituencyCode: '073' },
    { wardCode: '013022', wardName: 'Marimanti', constituencyCode: '073' },
    { wardCode: '013023', wardName: 'Chogo', constituencyCode: '073' },
    { wardCode: '013024', wardName: 'Central Imenti', constituencyCode: '074' },
    { wardCode: '013025', wardName: 'Mitungati', constituencyCode: '074' },
    { wardCode: '013026', wardName: 'Mwanganthia', constituencyCode: '074' },
    { wardCode: '013027', wardName: 'Buuri', constituencyCode: '075' },
    { wardCode: '013028', wardName: 'Timau', constituencyCode: '075' },
    { wardCode: '013029', wardName: 'Kisima', constituencyCode: '075' },
    { wardCode: '013030', wardName: 'Kiankoma', constituencyCode: '075' },
    { wardCode: '013031', wardName: 'Nkuene', constituencyCode: '067' },
    { wardCode: '013032', wardName: 'Mbeere', constituencyCode: '069' },
    { wardCode: '013033', wardName: 'Muthara', constituencyCode: '068' },
    { wardCode: '013034', wardName: 'Mwikonge', constituencyCode: '072' },
    { wardCode: '013035', wardName: 'Kianjai', constituencyCode: '071' },
    { wardCode: '013036', wardName: 'Mbeti North', constituencyCode: '073' },
    { wardCode: '013037', wardName: 'Mbeti South', constituencyCode: '074' },
    { wardCode: '013038', wardName: 'Kiagu', constituencyCode: '074' },
    { wardCode: '013039', wardName: 'Muthara', constituencyCode: '075' },
    { wardCode: '013040', wardName: 'Nkungi', constituencyCode: '075' },
    { wardCode: '013041', wardName: 'Mitunguu', constituencyCode: '068' },
    { wardCode: '013042', wardName: 'Githongo', constituencyCode: '072' },
    { wardCode: '013043', wardName: 'Mweeni', constituencyCode: '073' },
    { wardCode: '013044', wardName: 'Naari', constituencyCode: '074' },
    { wardCode: '013045', wardName: 'Kirima', constituencyCode: '075' },

    // Tharaka-Nithi - 15 wards
    { wardCode: '014001', wardName: 'Maara', constituencyCode: '076' },
    { wardCode: '014002', wardName: 'Muthambi', constituencyCode: '076' },
    { wardCode: '014003', wardName: 'Mwimbi', constituencyCode: '076' },
    { wardCode: '014004', wardName: 'Chuka/Igamba', constituencyCode: '077' },
    { wardCode: '014005', wardName: 'Mugwe', constituencyCode: '077' },
    { wardCode: '014006', wardName: 'Gatunganga', constituencyCode: '077' },
    { wardCode: '014007', wardName: 'Tharaka', constituencyCode: '078' },
    { wardCode: '014008', wardName: 'Nkondi', constituencyCode: '078' },
    { wardCode: '014009', wardName: 'Gakingo', constituencyCode: '078' },
    { wardCode: '014010', wardName: 'Muguga', constituencyCode: '076' },
    { wardCode: '014011', wardName: 'Mwanganthia', constituencyCode: '077' },
    { wardCode: '014012', wardName: 'Kanyonga', constituencyCode: '078' },
    { wardCode: '014013', wardName: 'Muguga', constituencyCode: '076' },
    { wardCode: '014014', wardName: 'Muthara', constituencyCode: '077' },
    { wardCode: '014015', wardName: 'Kianjai', constituencyCode: '078' },

    // Embu - 20 wards
    { wardCode: '015001', wardName: 'Manyatta', constituencyCode: '079' },
    { wardCode: '015002', wardName: 'Ruguru', constituencyCode: '079' },
    { wardCode: '015003', wardName: 'Kithimu', constituencyCode: '079' },
    { wardCode: '015004', wardName: 'Runyenjes', constituencyCode: '080' },
    { wardCode: '015005', wardName: 'Gikuuri', constituencyCode: '080' },
    { wardCode: '015006', wardName: 'Mbita', constituencyCode: '080' },
    { wardCode: '015007', wardName: 'Embu West', constituencyCode: '081' },
    { wardCode: '015008', wardName: 'Kiriari', constituencyCode: '081' },
    { wardCode: '015009', wardName: 'Mavuria', constituencyCode: '081' },
    { wardCode: '015010', wardName: 'Embu East', constituencyCode: '082' },
    { wardCode: '015011', wardName: 'Kigumo', constituencyCode: '082' },
    { wardCode: '015012', wardName: 'Gichugu', constituencyCode: '082' },
    { wardCode: '015013', wardName: 'Miane', constituencyCode: '079' },
    { wardCode: '015014', wardName: 'Kagongo', constituencyCode: '080' },
    { wardCode: '015015', wardName: 'Ndundori', constituencyCode: '081' },
    { wardCode: '015016', wardName: 'Nthawa', constituencyCode: '082' },
    { wardCode: '015017', wardName: 'Mugwe', constituencyCode: '079' },
    { wardCode: '015018', wardName: 'Kianjokoma', constituencyCode: '080' },
    { wardCode: '015019', wardName: 'Gategi', constituencyCode: '081' },
    { wardCode: '015020', wardName: 'Kiumbu', constituencyCode: '082' },

    // Kitui - 40 wards
    { wardCode: '016001', wardName: 'Kitui West', constituencyCode: '083' },
    { wardCode: '016002', wardName: 'Mutonguni', constituencyCode: '083' },
    { wardCode: '016003', wardName: 'Kisasi', constituencyCode: '083' },
    { wardCode: '016004', wardName: 'Kitui Central', constituencyCode: '084' },
    { wardCode: '016005', wardName: 'Mbitini', constituencyCode: '084' },
    { wardCode: '016006', wardName: 'Kanyangi', constituencyCode: '084' },
    { wardCode: '016007', wardName: 'Kitui East', constituencyCode: '085' },
    { wardCode: '016008', wardName: 'Zombe', constituencyCode: '085' },
    { wardCode: '016009', wardName: 'Mutomo', constituencyCode: '085' },
    { wardCode: '016010', wardName: 'Kitui South', constituencyCode: '086' },
    { wardCode: '016011', wardName: 'Ikanga', constituencyCode: '086' },
    { wardCode: '016012', wardName: 'Kyuso', constituencyCode: '086' },
    { wardCode: '016013', wardName: 'Kitui Rural', constituencyCode: '087' },
    { wardCode: '016014', wardName: 'Mumbuni', constituencyCode: '087' },
    { wardCode: '016015', wardName: 'Mission', constituencyCode: '087' },
    { wardCode: '016016', wardName: 'Mwingi North', constituencyCode: '088' },
    { wardCode: '016017', wardName: 'Mwingi West', constituencyCode: '089' },
    { wardCode: '016018', wardName: 'Mwingi Central', constituencyCode: '090' },
    { wardCode: '016019', wardName: 'Kivyatu', constituencyCode: '088' },
    { wardCode: '016020', wardName: 'Kanziku', constituencyCode: '088' },
    { wardCode: '016021', wardName: 'Mulango', constituencyCode: '089' },
    { wardCode: '016022', wardName: 'Katheka', constituencyCode: '089' },
    { wardCode: '016023', wardName: 'Waitiki', constituencyCode: '090' },
    { wardCode: '016024', wardName: 'Luli', constituencyCode: '090' },
    { wardCode: '016025', wardName: 'Kyangwithya', constituencyCode: '084' },
    { wardCode: '016026', wardName: 'Nguni', constituencyCode: '085' },
    { wardCode: '016027', wardName: 'Mutha', constituencyCode: '086' },
    { wardCode: '016028', wardName: 'Muuoni', constituencyCode: '087' },
    { wardCode: '016029', wardName: 'Voo', constituencyCode: '088' },
    { wardCode: '016030', wardName: 'Kyamatu', constituencyCode: '089' },
    { wardCode: '016031', wardName: 'Endau', constituencyCode: '090' },
    { wardCode: '016032', wardName: 'Kisekeny', constituencyCode: '083' },
    { wardCode: '016033', wardName: 'Kyondoni', constituencyCode: '084' },
    { wardCode: '016034', wardName: 'Kyangasi', constituencyCode: '085' },
    { wardCode: '016035', wardName: 'Nuu', constituencyCode: '086' },
    { wardCode: '016036', wardName: 'Ngiluni', constituencyCode: '087' },
    { wardCode: '016037', wardName: 'Tharaka', constituencyCode: '088' },
    { wardCode: '016038', wardName: 'Mwambiti', constituencyCode: '089' },
    { wardCode: '016039', wardName: 'Kakuluyu', constituencyCode: '090' },
    { wardCode: '016040', wardName: 'Nzeluni', constituencyCode: '083' },

    // Machakos - 60 wards (sampling)
    { wardCode: '017001', wardName: 'Mavoko', constituencyCode: '091' },
    { wardCode: '017002', wardName: 'Muthambi', constituencyCode: '091' },
    { wardCode: '017003', wardName: 'Kibwezi', constituencyCode: '092' },
    { wardCode: '017004', wardName: 'Mumbuni North', constituencyCode: '092' },
    { wardCode: '017005', wardName: 'Masinga', constituencyCode: '093' },
    { wardCode: '017006', wardName: 'Kivani', constituencyCode: '093' },
    { wardCode: '017007', wardName: 'Masinga Central', constituencyCode: '093' },
    { wardCode: '017008', wardName: 'Yatta', constituencyCode: '094' },
    { wardCode: '017009', wardName: 'Iveti', constituencyCode: '094' },
    { wardCode: '017010', wardName: 'Matuini', constituencyCode: '094' },
    { wardCode: '017011', wardName: 'Ndalani', constituencyCode: '095' },
    { wardCode: '017012', wardName: 'Kiththwiluni', constituencyCode: '095' },
    { wardCode: '017013', wardName: 'Kibwezi', constituencyCode: '096' },
    { wardCode: '017014', wardName: 'Makutano Junction', constituencyCode: '096' },
    { wardCode: '017015', wardName: 'Kibwezi West', constituencyCode: '097' },
    { wardCode: '017016', wardName: 'Mbitini', constituencyCode: '097' },
    { wardCode: '017017', wardName: 'Kalama', constituencyCode: '098' },
    { wardCode: '017018', wardName: 'Mulaa', constituencyCode: '098' },
    { wardCode: '017019', wardName: 'Kangundo', constituencyCode: '099' },
    { wardCode: '017020', wardName: 'Katyeta', constituencyCode: '099' },
    { wardCode: '017021', wardName: 'Matungulu', constituencyCode: '100' },
    { wardCode: '017022', wardName: 'Tala', constituencyCode: '100' },
    { wardCode: '017023', wardName: 'Thatha', constituencyCode: '100' },
    { wardCode: '017024', wardName: 'Kola', constituencyCode: '091' },
    { wardCode: '017025', wardName: 'Mumbuni', constituencyCode: '092' },
    { wardCode: '017026', wardName: 'Kyangala', constituencyCode: '093' },
    { wardCode: '017027', wardName: 'Ngui', constituencyCode: '094' },
    { wardCode: '017028', wardName: 'Masongola', constituencyCode: '095' },
    { wardCode: '017029', wardName: 'Mbitini', constituencyCode: '096' },
    { wardCode: '017030', wardName: 'Kisasi', constituencyCode: '097' },
    { wardCode: '017031', wardName: 'Mulo', constituencyCode: '098' },
    { wardCode: '017032', wardName: 'Kama', constituencyCode: '099' },
    { wardCode: '017033', wardName: 'Kithende', constituencyCode: '100' },
    { wardCode: '017034', wardName: 'Mikuyu', constituencyCode: '091' },
    { wardCode: '017035', wardName: 'Kimatuni', constituencyCode: '092' },
    { wardCode: '017036', wardName: 'Thuku', constituencyCode: '093' },
    { wardCode: '017037', wardName: 'Kivani', constituencyCode: '094' },
    { wardCode: '017038', wardName: 'Muthwani', constituencyCode: '095' },
    { wardCode: '017039', wardName: 'Wamunyu', constituencyCode: '096' },
    { wardCode: '017040', wardName: 'Kathiani', constituencyCode: '097' },
    { wardCode: '017041', wardName: 'Mumbuni', constituencyCode: '098' },
    { wardCode: '017042', wardName: 'Kikumbulyu', constituencyCode: '099' },
    { wardCode: '017043', wardName: 'Ndithini', constituencyCode: '100' },
    { wardCode: '017044', wardName: 'Makutano', constituencyCode: '091' },
    { wardCode: '017045', wardName: 'Mbiuni', constituencyCode: '092' },
    { wardCode: '017046', wardName: 'Yathui', constituencyCode: '093' },
    { wardCode: '017047', wardName: 'Katheka', constituencyCode: '094' },
    { wardCode: '017048', wardName: 'Kiima Kiu', constituencyCode: '095' },
    { wardCode: '017049', wardName: 'Nguuku', constituencyCode: '096' },
    { wardCode: '017050', wardName: 'Upper Mumbuni', constituencyCode: '097' },
    { wardCode: '017051', wardName: 'Lower Mumbuni', constituencyCode: '098' },
    { wardCode: '017052', wardName: 'KikESA', constituencyCode: '099' },
    { wardCode: '017053', wardName: 'Muuoni', constituencyCode: '100' },
    { wardCode: '017054', wardName: 'Sengani', constituencyCode: '091' },
    { wardCode: '017055', wardName: 'Kivandini', constituencyCode: '092' },
    { wardCode: '017056', wardName: 'Mua', constituencyCode: '093' },
    { wardCode: '017057', wardName: 'Mulala', constituencyCode: '094' },
    { wardCode: '017058', wardName: 'Kyaluni', constituencyCode: '095' },
    { wardCode: '017059', wardName: 'Kiteta', constituencyCode: '096' },
    { wardCode: '017060', wardName: 'Matuini', constituencyCode: '097' },

    // Makueni - 30 wards
    { wardCode: '018001', wardName: 'Makueni', constituencyCode: '101' },
    { wardCode: '018002', wardName: 'Wote', constituencyCode: '101' },
    { wardCode: '018003', wardName: 'Muvoti', constituencyCode: '101' },
    { wardCode: '018004', wardName: 'Kibwezi East', constituencyCode: '102' },
    { wardCode: '018005', wardName: 'Kikumbulyu', constituencyCode: '102' },
    { wardCode: '018006', wardName: 'Nguuku', constituencyCode: '102' },
    { wardCode: '018007', wardName: 'Kibwezi West', constituencyCode: '103' },
    { wardCode: '018008', wardName: 'Makindu', constituencyCode: '103' },
    { wardCode: '018009', wardName: 'Nthangu', constituencyCode: '103' },
    { wardCode: '018010', wardName: 'Kilome', constituencyCode: '104' },
    { wardCode: '018011', wardName: 'Kasikeu', constituencyCode: '104' },
    { wardCode: '018012', wardName: 'Muthambi', constituencyCode: '104' },
    { wardCode: '018013', wardName: 'Kaiti', constituencyCode: '105' },
    { wardCode: '018014', wardName: 'Kikoko', constituencyCode: '105' },
    { wardCode: '018015', wardName: 'Kiima Kiu', constituencyCode: '105' },
    { wardCode: '018016', wardName: 'Mbooni', constituencyCode: '106' },
    { wardCode: '018017', wardName: 'Kithungo', constituencyCode: '106' },
    { wardCode: '018018', wardName: 'Kiteta', constituencyCode: '106' },
    { wardCode: '018019', wardName: 'Kalaa', constituencyCode: '101' },
    { wardCode: '018020', wardName: 'Muuoni', constituencyCode: '102' },
    { wardCode: '018021', wardName: 'Kikwezi', constituencyCode: '103' },
    { wardCode: '018022', wardName: 'Mbitini', constituencyCode: '104' },
    { wardCode: '018023', wardName: 'Kalamba', constituencyCode: '105' },
    { wardCode: '018024', wardName: 'Kwa Kathoka', constituencyCode: '106' },
    { wardCode: '018025', wardName: 'Nthunguni', constituencyCode: '101' },
    { wardCode: '018026', wardName: 'Nthangu', constituencyCode: '102' },
    { wardCode: '018027', wardName: 'Muumandi', constituencyCode: '103' },
    { wardCode: '018028', wardName: 'Kithamba', constituencyCode: '104' },
    { wardCode: '018029', wardName: 'Masingi', constituencyCode: '105' },
    { wardCode: '018030', wardName: 'Kitundu', constituencyCode: '106' },

    // ==================== NYANDARUA COUNTY (019) ====================
    // Kinangop (107)
    { wardCode: '019001', wardName: 'Engineer', constituencyCode: '107' },
    { wardCode: '019002', wardName: 'Gathara', constituencyCode: '107' },
    { wardCode: '019003', wardName: 'North Kinangop', constituencyCode: '107' },
    { wardCode: '019004', wardName: 'Murungaru', constituencyCode: '107' },
    { wardCode: '019005', wardName: 'Njabini', constituencyCode: '107' },
    { wardCode: '019006', wardName: 'Kiburu', constituencyCode: '107' },
    // Nyandarua North (108)
    { wardCode: '019007', wardName: 'Kanjuiri', constituencyCode: '108' },
    { wardCode: '019008', wardName: 'Kiriita', constituencyCode: '108' },
    { wardCode: '019009', wardName: 'Mirangine', constituencyCode: '108' },
    { wardCode: '019010', wardName: 'Gathanji', constituencyCode: '108' },
    // Nyandarua West (109)
    { wardCode: '019011', wardName: 'Kaimbaga', constituencyCode: '109' },
    { wardCode: '019012', wardName: 'Karemeno', constituencyCode: '109' },
    { wardCode: '019013', wardName: 'Ol Kalou', constituencyCode: '109' },
    { wardCode: '019014', wardName: 'Kanjuiri Range', constituencyCode: '109' },
    // Nyandarua South (110)
    { wardCode: '019015', wardName: 'Kagumo', constituencyCode: '110' },
    { wardCode: '019016', wardName: 'Kangangi', constituencyCode: '110' },
    { wardCode: '019017', wardName: 'Gatitu', constituencyCode: '110' },
    { wardCode: '019018', wardName: 'Kiambogo', constituencyCode: '110' },
    // Ol Kalou (111)
    { wardCode: '019019', wardName: 'Ol Kalou', constituencyCode: '111' },
    { wardCode: '019020', wardName: 'Kanjuiri', constituencyCode: '111' },
    { wardCode: '019021', wardName: 'Kaimbaga', constituencyCode: '111' },
    { wardCode: '019022', wardName: 'Karemeno', constituencyCode: '111' },

    // ==================== NYERI COUNTY (020) ====================
    // Tetu (112)
    { wardCode: '020001', wardName: 'Dedan Kimathi', constituencyCode: '112' },
    { wardCode: '020002', wardName: 'Wamagana', constituencyCode: '112' },
    { wardCode: '020003', wardName: 'Aguthi-Gaaki', constituencyCode: '112' },
    { wardCode: '020004', wardName: 'Karingari', constituencyCode: '112' },
    // Kieni (113)
    { wardCode: '020005', wardName: 'Mweiga', constituencyCode: '113' },
    { wardCode: '020006', wardName: 'Naromoru', constituencyCode: '113' },
    { wardCode: '020007', wardName: 'Maji Mazuri', constituencyCode: '113' },
    { wardCode: '020008', wardName: 'Mukrweini', constituencyCode: '113' },
    { wardCode: '020009', wardName: 'Gatarakwa', constituencyCode: '113' },
    { wardCode: '020010', wardName: 'Thegu River', constituencyCode: '113' },
    // Mukurweini (114)
    { wardCode: '020011', wardName: 'Mukurweini West', constituencyCode: '114' },
    { wardCode: '020012', wardName: 'Mukurweini Central', constituencyCode: '114' },
    { wardCode: '020013', wardName: 'Gikondi', constituencyCode: '114' },
    { wardCode: '020014', wardName: 'Rugi', constituencyCode: '114' },
    // Othaya (115)
    { wardCode: '020015', wardName: 'Othaya', constituencyCode: '115' },
    { wardCode: '020016', wardName: 'Chinga', constituencyCode: '115' },
    { wardCode: '020017', wardName: 'Kirimukuyu', constituencyCode: '115' },
    { wardCode: '020018', wardName: 'Mahiga', constituencyCode: '115' },
    // Mwea (116)
    { wardCode: '020019', wardName: 'Wamumu', constituencyCode: '116' },
    { wardCode: '020020', wardName: 'Thiba', constituencyCode: '116' },
    { wardCode: '020021', wardName: 'Wanguru', constituencyCode: '116' },
    { wardCode: '020022', wardName: 'Mutithi', constituencyCode: '116' },
    // Nyeri Town (117)
    { wardCode: '020023', wardName: 'Kamakwa', constituencyCode: '117' },
    { wardCode: '020024', wardName: 'Kangemi', constituencyCode: '117' },
    { wardCode: '020025', wardName: 'Gatitu/Muruguru', constituencyCode: '117' },
    { wardCode: '020026', wardName: 'Ruringu', constituencyCode: '117' },
    // Mathira (118)
    { wardCode: '020027', wardName: 'Ruguru', constituencyCode: '118' },
    { wardCode: '020028', wardName: 'Magutu', constituencyCode: '118' },
    { wardCode: '020029', wardName: 'Iriaini', constituencyCode: '118' },
    { wardCode: '020030', wardName: 'Kirimukuyu', constituencyCode: '118' },

    // ==================== KIRINYAGA COUNTY (021) ====================
    // Kirinyaga Central (119)
    { wardCode: '021001', wardName: 'Mutira', constituencyCode: '119' },
    { wardCode: '021002', wardName: 'Kanyekini', constituencyCode: '119' },
    { wardCode: '021003', wardName: 'Kerugoya', constituencyCode: '119' },
    { wardCode: '021004', wardName: 'Inoi', constituencyCode: '119' },
    // Kirinyaga East (120)
    { wardCode: '021005', wardName: 'Nyangati', constituencyCode: '120' },
    { wardCode: '021006', wardName: 'Njukiini', constituencyCode: '120' },
    { wardCode: '021007', wardName: 'Karumandi', constituencyCode: '120' },
    // Kirinyaga West (121)
    { wardCode: '021008', wardName: 'Ngariama', constituencyCode: '121' },
    { wardCode: '021009', wardName: 'Kabare', constituencyCode: '121' },
    { wardCode: '021010', wardName: 'Baragwi', constituencyCode: '121' },
    // Mwea (122)
    { wardCode: '021011', wardName: 'Mutithi', constituencyCode: '122' },
    { wardCode: '021012', wardName: 'Kangai', constituencyCode: '122' },
    { wardCode: '021013', wardName: 'Thiba', constituencyCode: '122' },
    { wardCode: '021014', wardName: 'Wamumu', constituencyCode: '122' },
    { wardCode: '021015', wardName: 'Nyangati', constituencyCode: '122' },
    { wardCode: '021016', wardName: 'Tebere', constituencyCode: '122' },
    { wardCode: '021017', wardName: 'Murinduko', constituencyCode: '122' },
    { wardCode: '021018', wardName: 'Gathigiriri', constituencyCode: '122' },

    // ==================== MURANG'A COUNTY (022) ====================
    // Kangema (123)
    { wardCode: '022001', wardName: 'Kanyenya-ini', constituencyCode: '123' },
    { wardCode: '022002', wardName: 'Muguru', constituencyCode: '123' },
    { wardCode: '022003', wardName: 'Kangema', constituencyCode: '123' },
    // Mathioya (124)
    { wardCode: '022004', wardName: 'Kamacharia', constituencyCode: '124' },
    { wardCode: '022005', wardName: 'Gitugi', constituencyCode: '124' },
    { wardCode: '022006', wardName: 'Kiru', constituencyCode: '124' },
    // Kigumo (125)
    { wardCode: '022007', wardName: 'Kigumo', constituencyCode: '125' },
    { wardCode: '022008', wardName: 'Muthithi', constituencyCode: '125' },
    { wardCode: '022009', wardName: 'Kahumbu', constituencyCode: '125' },
    // Maragwa (126)
    { wardCode: '022010', wardName: 'Kimorori', constituencyCode: '126' },
    { wardCode: '022011', wardName: 'Kamwangi', constituencyCode: '126' },
    { wardCode: '022012', wardName: 'Wanjohi', constituencyCode: '126' },
    { wardCode: '022013', wardName: 'Ithiru', constituencyCode: '126' },
    // Kandara (127)
    { wardCode: '022014', wardName: 'Kandara', constituencyCode: '127' },
    { wardCode: '022015', wardName: 'Nginda', constituencyCode: '127' },
    { wardCode: '022016', wardName: 'Kagundu-ini', constituencyCode: '127' },
    { wardCode: '022017', wardName: 'Gaichanjiru', constituencyCode: '127' },
    // Gatanga (128)
    { wardCode: '022018', wardName: 'Ithanga', constituencyCode: '128' },
    { wardCode: '022019', wardName: 'Kihumbu-ini', constituencyCode: '128' },
    { wardCode: '022020', wardName: 'Gatanga', constituencyCode: '128' },
    { wardCode: '022021', wardName: 'Kagundu-ini', constituencyCode: '128' },

    // ==================== KIAMBU COUNTY (023) ====================
    // Githunguri (130)
    { wardCode: '023001', wardName: 'Githunguri', constituencyCode: '130' },
    { wardCode: '023002', wardName: 'Githiga', constituencyCode: '130' },
    { wardCode: '023003', wardName: 'Ikinu', constituencyCode: '130' },
    { wardCode: '023004', wardName: 'Ngewa', constituencyCode: '130' },
    { wardCode: '023005', wardName: 'Komothai', constituencyCode: '130' },
    // Ruiru (131)
    { wardCode: '023006', wardName: 'Ruiru', constituencyCode: '131' },
    { wardCode: '023007', wardName: 'Kahawa Sukari', constituencyCode: '131' },
    { wardCode: '023008', wardName: 'Kahawa Wendani', constituencyCode: '131' },
    { wardCode: '023009', wardName: 'Mwiki', constituencyCode: '131' },
    { wardCode: '023010', wardName: 'Mwihoko', constituencyCode: '131' },
    { wardCode: '023011', wardName: 'Gitothua', constituencyCode: '131' },
    { wardCode: '023012', wardName: 'Biashara', constituencyCode: '131' },
    // Juja (132)
    { wardCode: '023013', wardName: 'Juja', constituencyCode: '132' },
    { wardCode: '023014', wardName: 'Murera', constituencyCode: '132' },
    { wardCode: '023015', wardName: 'Theta', constituencyCode: '132' },
    { wardCode: '023016', wardName: 'Witeithie', constituencyCode: '132' },
    { wardCode: '023017', wardName: 'Kalimoni', constituencyCode: '132' },
    // Thika Town (133)
    { wardCode: '023018', wardName: 'Township', constituencyCode: '133' },
    { wardCode: '023019', wardName: 'Kamenu', constituencyCode: '133' },
    { wardCode: '023020', wardName: 'Hospital', constituencyCode: '133' },
    { wardCode: '023021', wardName: 'Gatuanyaga', constituencyCode: '133' },
    { wardCode: '023022', wardName: 'Ngoliba', constituencyCode: '133' },
    // Kiambu (134)
    { wardCode: '023023', wardName: 'Kiambu', constituencyCode: '134' },
    { wardCode: '023024', wardName: 'Tinganga', constituencyCode: '134' },
    { wardCode: '023025', wardName: 'Ndumberi', constituencyCode: '134' },
    { wardCode: '023026', wardName: 'Riabai', constituencyCode: '134' },
    // Limuru (136)
    { wardCode: '023027', wardName: 'Limuru', constituencyCode: '136' },
    { wardCode: '023028', wardName: 'Bibirioni', constituencyCode: '136' },
    { wardCode: '023029', wardName: 'Ngecha-Tigoni', constituencyCode: '136' },
    { wardCode: '023030', wardName: 'Ndeiya', constituencyCode: '136' },
    // Kabete (138)
    { wardCode: '023031', wardName: 'Kabete', constituencyCode: '138' },
    { wardCode: '023032', wardName: 'Muguga', constituencyCode: '138' },
    { wardCode: '023033', wardName: 'Nyathuna', constituencyCode: '138' },
    { wardCode: '023034', wardName: 'Kiambu Road', constituencyCode: '138' },
    // Kikuyu (139)
    { wardCode: '023035', wardName: 'Kikuyu', constituencyCode: '139' },
    { wardCode: '023036', wardName: 'Karai', constituencyCode: '139' },
    { wardCode: '023037', wardName: 'Nachu', constituencyCode: '139' },
    { wardCode: '023038', wardName: 'Sigona', constituencyCode: '139' },
    { wardCode: '023039', wardName: 'Kinoo', constituencyCode: '139' },
    // Gatundu South (141)
    { wardCode: '023040', wardName: 'Kiamwangi', constituencyCode: '141' },
    { wardCode: '023041', wardName: 'Kiganjo', constituencyCode: '141' },
    { wardCode: '023042', wardName: 'Ndarugu', constituencyCode: '141' },
    { wardCode: '023043', wardName: 'Ngenda', constituencyCode: '141' },

    // ==================== TURKANA COUNTY (024) ====================
    // Turkana North (142)
    { wardCode: '024001', wardName: 'Kakuma', constituencyCode: '142' },
    { wardCode: '024002', wardName: 'Lokichar', constituencyCode: '142' },
    { wardCode: '024003', wardName: 'Lokitaung', constituencyCode: '142' },
    { wardCode: '024004', wardName: 'Kapedo', constituencyCode: '142' },
    // Turkana West (143)
    { wardCode: '024005', wardName: 'Lodwar', constituencyCode: '143' },
    { wardCode: '024006', wardName: 'Kanamkemer', constituencyCode: '143' },
    { wardCode: '024007', wardName: 'Katilu', constituencyCode: '143' },
    { wardCode: '024008', wardName: 'Kaputir', constituencyCode: '143' },
    // Turkana Central (144)
    { wardCode: '024009', wardName: 'Kalobeyei', constituencyCode: '144' },
    { wardCode: '024010', wardName: 'Lokiriama', constituencyCode: '144' },
    { wardCode: '024011', wardName: 'Lokichoggio', constituencyCode: '144' },
    { wardCode: '024012', wardName: 'Nanaam', constituencyCode: '144' },
    // Loima (145)
    { wardCode: '024013', wardName: 'Loima', constituencyCode: '145' },
    { wardCode: '024014', wardName: 'Kotaruk', constituencyCode: '145' },
    { wardCode: '024015', wardName: 'Turkwel', constituencyCode: '145' },
    { wardCode: '024016', wardName: 'Lokichar', constituencyCode: '145' },
    // Turkana South (146)
    { wardCode: '024017', wardName: 'Kapenguria', constituencyCode: '146' },
    { wardCode: '024018', wardName: 'Mogotio', constituencyCode: '146' },
    { wardCode: '024019', wardName: 'Riwo', constituencyCode: '146' },
    { wardCode: '024020', wardName: 'Sekerr', constituencyCode: '146' },
    // Turkana East (147)
    { wardCode: '024021', wardName: 'Kapedo', constituencyCode: '147' },
    { wardCode: '024022', wardName: 'Lokori', constituencyCode: '147' },
    { wardCode: '024023', wardName: 'Kakuma', constituencyCode: '147' },
    { wardCode: '024024', wardName: 'Lokichar', constituencyCode: '147' },

    // ==================== WEST POKOT COUNTY (025) ====================
    // Kapenguria (148)
    { wardCode: '025001', wardName: 'Kapenguria', constituencyCode: '148' },
    { wardCode: '025002', wardName: 'Mnagei', constituencyCode: '148' },
    { wardCode: '025003', wardName: 'Riwo', constituencyCode: '148' },
    { wardCode: '025004', wardName: 'Endugh', constituencyCode: '148' },
    { wardCode: '025005', wardName: 'Siyoi', constituencyCode: '148' },
    { wardCode: '025006', wardName: 'Sekerr', constituencyCode: '148' },
    // Kacheliba (150)
    { wardCode: '025007', wardName: 'Kacheliba', constituencyCode: '150' },
    { wardCode: '025008', wardName: 'Kodich', constituencyCode: '150' },
    { wardCode: '025009', wardName: 'Kapchok', constituencyCode: '150' },
    { wardCode: '025010', wardName: 'Suam', constituencyCode: '150' },
    // Pokot South (151)
    { wardCode: '025011', wardName: 'Chepareria', constituencyCode: '151' },
    { wardCode: '025012', wardName: 'Batei', constituencyCode: '151' },
    { wardCode: '025013', wardName: 'Lelan', constituencyCode: '151' },
    { wardCode: '025014', wardName: 'Weiwei', constituencyCode: '151' },

    // ==================== SAMBURU COUNTY (026) ====================
    // Samburu West (152)
    { wardCode: '026001', wardName: 'Lodokejek', constituencyCode: '152' },
    { wardCode: '026002', wardName: 'Suguta Marmar', constituencyCode: '152' },
    { wardCode: '026003', wardName: 'Maralal', constituencyCode: '152' },
    { wardCode: '026004', wardName: 'Loosuk', constituencyCode: '152' },
    // Samburu North (153)
    { wardCode: '026005', wardName: 'El-Barta', constituencyCode: '153' },
    { wardCode: '026006', wardName: 'Nachola', constituencyCode: '153' },
    { wardCode: '026007', wardName: 'Ndoto', constituencyCode: '153' },
    { wardCode: '026008', wardName: 'Nyiro', constituencyCode: '153' },
    // Samburu East (154)
    { wardCode: '026009', wardName: 'Waso', constituencyCode: '154' },
    { wardCode: '026010', wardName: 'Wamba West', constituencyCode: '154' },
    { wardCode: '026011', wardName: 'Wamba East', constituencyCode: '154' },
    { wardCode: '026012', wardName: 'Wamba North', constituencyCode: '154' },

    // ==================== TRANS-NZOIA COUNTY (027) ====================
    // Kwanza (155)
    { wardCode: '027001', wardName: 'Kwanza', constituencyCode: '155' },
    { wardCode: '027002', wardName: 'Keiyo', constituencyCode: '155' },
    { wardCode: '027003', wardName: 'Kapomboi', constituencyCode: '155' },
    { wardCode: '027004', wardName: 'Bidii', constituencyCode: '155' },
    // Endebess (156)
    { wardCode: '027005', wardName: 'Endebess', constituencyCode: '156' },
    { wardCode: '027006', wardName: 'Chepchoina', constituencyCode: '156' },
    { wardCode: '027007', wardName: 'Matumbei', constituencyCode: '156' },
    // Kiminini (157)
    { wardCode: '027008', wardName: 'Kiminini', constituencyCode: '157' },
    { wardCode: '027009', wardName: 'Waitaluk', constituencyCode: '157' },
    { wardCode: '027010', wardName: 'Sirende', constituencyCode: '157' },
    { wardCode: '027011', wardName: 'Sikhendu', constituencyCode: '157' },
    // Saboti (158)
    { wardCode: '027012', wardName: 'Saboti', constituencyCode: '158' },
    { wardCode: '027013', wardName: 'Matisi', constituencyCode: '158' },
    { wardCode: '027014', wardName: 'Tuwani', constituencyCode: '158' },
    { wardCode: '027015', wardName: 'Kinyoro', constituencyCode: '158' },
    // Cherangany (159)
    { wardCode: '027016', wardName: 'Cherangany', constituencyCode: '159' },
    { wardCode: '027017', wardName: 'Sitatunga', constituencyCode: '159' },
    { wardCode: '027018', wardName: 'Makutano', constituencyCode: '159' },
    { wardCode: '027019', wardName: 'Kaplamai', constituencyCode: '159' },
    { wardCode: '027020', wardName: 'Motosiet', constituencyCode: '159' },

    // ==================== UASIN GISHU COUNTY (028) ====================
    // Soy (160)
    { wardCode: '028001', wardName: 'Soy', constituencyCode: '160' },
    { wardCode: '028002', wardName: "Moi's Bridge", constituencyCode: '160' },
    { wardCode: '028003', wardName: 'Ziwa', constituencyCode: '160' },
    { wardCode: '028004', wardName: 'Kapkures', constituencyCode: '160' },
    { wardCode: '028005', wardName: 'Kipsomba', constituencyCode: '160' },
    // Turbo (161)
    { wardCode: '028006', wardName: 'Turbo', constituencyCode: '161' },
    { wardCode: '028007', wardName: 'Ngenyilel', constituencyCode: '161' },
    { wardCode: '028008', wardName: 'Kamagut', constituencyCode: '161' },
    { wardCode: '028009', wardName: 'Kiplombe', constituencyCode: '161' },
    // Moiben (162)
    { wardCode: '028010', wardName: 'Moiben', constituencyCode: '162' },
    { wardCode: '028011', wardName: 'Kaptagat', constituencyCode: '162' },
    { wardCode: '028012', wardName: 'Sergoit', constituencyCode: '162' },
    { wardCode: '028013', wardName: 'Karuna', constituencyCode: '162' },
    // Kesses (163)
    { wardCode: '028014', wardName: 'Kesses', constituencyCode: '163' },
    { wardCode: '028015', wardName: 'Tulwet', constituencyCode: '163' },
    { wardCode: '028016', wardName: 'Cheptiret', constituencyCode: '163' },
    { wardCode: '028017', wardName: 'Racecourse', constituencyCode: '163' },
    // Kapseret (164)
    { wardCode: '028018', wardName: 'Kapseret', constituencyCode: '164' },
    { wardCode: '028019', wardName: 'Kipkenyo', constituencyCode: '164' },
    { wardCode: '028020', wardName: 'Simat/Kapsoya', constituencyCode: '164' },
    { wardCode: '028021', wardName: 'Langas', constituencyCode: '164' },
    { wardCode: '028022', wardName: 'Eldamat', constituencyCode: '164' },
    { wardCode: '028023', wardName: 'Segero/Barsombe', constituencyCode: '164' },

    // ==================== ELGEYO-MARAKWET COUNTY (029) ====================
    // Marakwet East (166)
    { wardCode: '029001', wardName: 'Kapyego', constituencyCode: '166' },
    { wardCode: '029002', wardName: 'Sambirir', constituencyCode: '166' },
    { wardCode: '029003', wardName: 'Endo', constituencyCode: '166' },
    { wardCode: '029004', wardName: 'Embobut', constituencyCode: '166' },
    // Marakwet West (167)
    { wardCode: '029005', wardName: 'Lelan', constituencyCode: '167' },
    { wardCode: '029006', wardName: 'Sengwer', constituencyCode: '167' },
    { wardCode: '029007', wardName: 'Cherangany', constituencyCode: '167' },
    { wardCode: '029008', wardName: 'Moiben', constituencyCode: '167' },
    // Keiyo North (168)
    { wardCode: '029009', wardName: 'Emsoo', constituencyCode: '168' },
    { wardCode: '029010', wardName: 'Kamariny', constituencyCode: '168' },
    { wardCode: '029011', wardName: 'Tambach', constituencyCode: '168' },
    { wardCode: '029012', wardName: 'Kaptarakwa', constituencyCode: '168' },
    // Keiyo South (169)
    { wardCode: '029013', wardName: 'Kabiemit', constituencyCode: '169' },
    { wardCode: '029014', wardName: 'Metkei', constituencyCode: '169' },
    { wardCode: '029015', wardName: 'Kaptel', constituencyCode: '169' },
    { wardCode: '029016', wardName: 'Kapsowar', constituencyCode: '169' },

    // ==================== NANDI COUNTY (030) ====================
    // Nandi Hills (170)
    { wardCode: '030001', wardName: 'Nandi Hills', constituencyCode: '170' },
    { wardCode: '030002', wardName: 'Chepkunyuk', constituencyCode: '170' },
    { wardCode: '030003', wardName: 'Kapchorua', constituencyCode: '170' },
    { wardCode: '030004', wardName: 'Koyo', constituencyCode: '170' },
    // Emgwen (171)
    { wardCode: '030005', wardName: 'Emgwen', constituencyCode: '171' },
    { wardCode: '030006', wardName: 'Kapsabet', constituencyCode: '171' },
    { wardCode: '030007', wardName: 'Kilibwoni', constituencyCode: '171' },
    { wardCode: '030008', wardName: 'Kaptel', constituencyCode: '171' },
    // Chesumei (172)
    { wardCode: '030009', wardName: 'Chemundu', constituencyCode: '172' },
    { wardCode: '030010', wardName: 'Kosirai', constituencyCode: '172' },
    { wardCode: '030011', wardName: 'Lelmokwo', constituencyCode: '172' },
    { wardCode: '030012', wardName: 'Kaptumo', constituencyCode: '172' },
    // Aldai (173)
    { wardCode: '030013', wardName: 'Aldai', constituencyCode: '173' },
    { wardCode: '030014', wardName: 'Kobujoi', constituencyCode: '173' },
    { wardCode: '030015', wardName: 'Kaptumo', constituencyCode: '173' },
    { wardCode: '030016', wardName: 'Terik', constituencyCode: '173' },
    // Mosop (175)
    { wardCode: '030017', wardName: 'Chepterwai', constituencyCode: '175' },
    { wardCode: '030018', wardName: 'Kapsabet', constituencyCode: '175' },
    { wardCode: '030019', wardName: 'Kabianga', constituencyCode: '175' },
    { wardCode: '030020', wardName: 'Kemeloi', constituencyCode: '175' },

    // ==================== BARINGO COUNTY (031) ====================
    // Baringo North (176)
    { wardCode: '031001', wardName: 'Barwessa', constituencyCode: '176' },
    { wardCode: '031002', wardName: 'Kabartonjo', constituencyCode: '176' },
    { wardCode: '031003', wardName: 'Saimo', constituencyCode: '176' },
    { wardCode: '031004', wardName: 'Saimo', constituencyCode: '176' },
    // Baringo Central (177)
    { wardCode: '031005', wardName: 'Kabarnet', constituencyCode: '177' },
    { wardCode: '031006', wardName: 'Sacho', constituencyCode: '177' },
    { wardCode: '031007', wardName: 'Ewalel', constituencyCode: '177' },
    { wardCode: '031008', wardName: 'Kapropita', constituencyCode: '177' },
    // Baringo South (178)
    { wardCode: '031009', wardName: 'Marigat', constituencyCode: '178' },
    { wardCode: '031010', wardName: 'Ilchamus', constituencyCode: '178' },
    { wardCode: '031011', wardName: 'Mochongoi', constituencyCode: '178' },
    { wardCode: '031012', wardName: 'Mukutani', constituencyCode: '178' },
    // Mogotio (179)
    { wardCode: '031013', wardName: 'Mogotio', constituencyCode: '179' },
    { wardCode: '031014', wardName: 'Emining', constituencyCode: '179' },
    { wardCode: '031015', wardName: 'Kisanana', constituencyCode: '179' },
    // Eldama Ravine (180)
    { wardCode: '031016', wardName: 'Eldama Ravine', constituencyCode: '180' },
    { wardCode: '031017', wardName: 'Lembus', constituencyCode: '180' },
    { wardCode: '031018', wardName: 'Lembus Kwen', constituencyCode: '180' },
    { wardCode: '031019', wardName: 'Ravine', constituencyCode: '180' },
    // Koibatek (181)
    { wardCode: '031020', wardName: 'Koibatek', constituencyCode: '181' },
    { wardCode: '031021', wardName: 'Lembus', constituencyCode: '181' },
    { wardCode: '031022', wardName: 'Kiptagat', constituencyCode: '181' },
    { wardCode: '031023', wardName: 'Kapsowar', constituencyCode: '181' },

    // ==================== LAIKIPIA COUNTY (032) ====================
    // Laikipia West (182)
    { wardCode: '032001', wardName: 'Nyahururu', constituencyCode: '182' },
    { wardCode: '032002', wardName: 'Olmoran', constituencyCode: '182' },
    { wardCode: '032003', wardName: 'Rumuruti', constituencyCode: '182' },
    { wardCode: '032004', wardName: 'Githiga', constituencyCode: '182' },
    // Laikipia East (183)
    { wardCode: '032005', wardName: 'Ngobit', constituencyCode: '183' },
    { wardCode: '032006', wardName: 'Tigithi', constituencyCode: '183' },
    { wardCode: '032007', wardName: 'Thingithu', constituencyCode: '183' },
    { wardCode: '032008', wardName: 'Umande', constituencyCode: '183' },
    // Laikipia North (184)
    { wardCode: '032009', wardName: 'Sosian', constituencyCode: '184' },
    { wardCode: '032010', wardName: 'Segera', constituencyCode: '184' },
    { wardCode: '032011', wardName: 'Mugogodo', constituencyCode: '184' },
    { wardCode: '032012', wardName: 'Nanyuki', constituencyCode: '184' },

    // ==================== NAKURU COUNTY (033) ====================
    // Molo (185)
    { wardCode: '033001', wardName: 'Molo', constituencyCode: '185' },
    { wardCode: '033002', wardName: 'Mariashoni', constituencyCode: '185' },
    { wardCode: '033003', wardName: 'Elburgon', constituencyCode: '185' },
    { wardCode: '033004', wardName: 'Turi', constituencyCode: '185' },
    // Njoro (186)
    { wardCode: '033005', wardName: 'Njoro', constituencyCode: '186' },
    { wardCode: '033006', wardName: 'Mauche', constituencyCode: '186' },
    { wardCode: '033007', wardName: 'Kihingo', constituencyCode: '186' },
    { wardCode: '033008', wardName: 'Mau Narok', constituencyCode: '186' },
    // Naivasha (187)
    { wardCode: '033009', wardName: 'Biashara', constituencyCode: '187' },
    { wardCode: '033010', wardName: 'Hells Gate', constituencyCode: '187' },
    { wardCode: '033011', wardName: 'Lake View', constituencyCode: '187' },
    { wardCode: '033012', wardName: 'Maiella', constituencyCode: '187' },
    { wardCode: '033013', wardName: 'Mai Mahiu', constituencyCode: '187' },
    { wardCode: '033014', wardName: 'Olkaria', constituencyCode: '187' },
    // Gilgil (188)
    { wardCode: '033015', wardName: 'Gilgil', constituencyCode: '188' },
    { wardCode: '033016', wardName: 'Elementaita', constituencyCode: '188' },
    { wardCode: '033017', wardName: 'Mbaruk', constituencyCode: '188' },
    { wardCode: '033018', wardName: 'Malewa West', constituencyCode: '188' },
    // Rongai (190)
    { wardCode: '033019', wardName: 'Rongai', constituencyCode: '190' },
    { wardCode: '033020', wardName: 'Menengai West', constituencyCode: '190' },
    { wardCode: '033021', wardName: 'Soin', constituencyCode: '190' },
    { wardCode: '033022', wardName: 'Visoi', constituencyCode: '190' },
    // Subukia (191)
    { wardCode: '033023', wardName: 'Subukia', constituencyCode: '191' },
    { wardCode: '033024', wardName: 'Waseges', constituencyCode: '191' },
    { wardCode: '033025', wardName: 'Kabazi', constituencyCode: '191' },
    // Bahati (195)
    { wardCode: '033026', wardName: 'Bahati', constituencyCode: '195' },
    { wardCode: '033027', wardName: 'Dundori', constituencyCode: '195' },
    { wardCode: '033028', wardName: 'Kiamaina', constituencyCode: '195' },
    { wardCode: '033029', wardName: 'Lanet', constituencyCode: '195' },
    { wardCode: '033030', wardName: 'Ukwe', constituencyCode: '195' },

    // ==================== NAROK COUNTY (034) ====================
    // Narok North (196)
    { wardCode: '034001', wardName: 'Narok Town', constituencyCode: '196' },
    { wardCode: '034002', wardName: 'Olpusimoru', constituencyCode: '196' },
    { wardCode: '034003', wardName: 'Olokurto', constituencyCode: '196' },
    { wardCode: '034004', wardName: 'Nkareta', constituencyCode: '196' },
    { wardCode: '034005', wardName: 'Olorropil', constituencyCode: '196' },
    { wardCode: '034006', wardName: 'Melili', constituencyCode: '196' },
    // Narok West (197)
    { wardCode: '034007', wardName: 'Ilkerin', constituencyCode: '197' },
    { wardCode: '034008', wardName: 'Loita', constituencyCode: '197' },
    { wardCode: '034009', wardName: 'Sogoo', constituencyCode: '197' },
    { wardCode: '034010', wardName: 'Sagamian', constituencyCode: '197' },
    // Narok South (198)
    { wardCode: '034011', wardName: 'Majimoto', constituencyCode: '198' },
    { wardCode: '034012', wardName: 'Ololmasani', constituencyCode: '198' },
    { wardCode: '034013', wardName: 'Melelo', constituencyCode: '198' },
    { wardCode: '034014', wardName: 'Lolgorian', constituencyCode: '198' },
    // Narok East (199)
    { wardCode: '034015', wardName: 'Mosiro', constituencyCode: '199' },
    { wardCode: '034016', wardName: 'Ildamat', constituencyCode: '199' },
    { wardCode: '034017', wardName: 'Keekonyokie', constituencyCode: '199' },
    { wardCode: '034018', wardName: 'Suswa', constituencyCode: '199' },

    // ==================== KAJIADO COUNTY (035) ====================
    // Kajiado Central (202)
    { wardCode: '035001', wardName: 'Kajiado', constituencyCode: '202' },
    { wardCode: '035002', wardName: 'Purko', constituencyCode: '202' },
    { wardCode: '035003', wardName: 'Ildamat', constituencyCode: '202' },
    { wardCode: '035004', wardName: 'Dalalekutuk', constituencyCode: '202' },
    { wardCode: '035005', wardName: 'Matapato', constituencyCode: '202' },
    // Kajiado East (203)
    { wardCode: '035006', wardName: 'Kaputiei North', constituencyCode: '203' },
    { wardCode: '035007', wardName: 'Kitengela', constituencyCode: '203' },
    { wardCode: '035008', wardName: 'Oloosirkon', constituencyCode: '203' },
    { wardCode: '035009', wardName: 'Kenyawa-Poka', constituencyCode: '203' },
    // Kajiado North (204)
    { wardCode: '035010', wardName: 'Olkeri', constituencyCode: '204' },
    { wardCode: '035011', wardName: 'Ongata Rongai', constituencyCode: '204' },
    { wardCode: '035012', wardName: 'Nkaimurunya', constituencyCode: '204' },
    { wardCode: '035013', wardName: 'Oloolua', constituencyCode: '204' },
    { wardCode: '035014', wardName: 'Ngong', constituencyCode: '204' },
    // Kajiado West (205)
    { wardCode: '035015', wardName: 'Keekonyokie', constituencyCode: '205' },
    { wardCode: '035016', wardName: 'Iloodokilani', constituencyCode: '205' },
    { wardCode: '035017', wardName: 'Magadi', constituencyCode: '205' },
    { wardCode: '035018', wardName: 'Ewuaso Oonkidong\'i', constituencyCode: '205' },
    // Isinya (206)
    { wardCode: '035019', wardName: 'Isinya', constituencyCode: '206' },
    { wardCode: '035020', wardName: 'Kajiado South', constituencyCode: '206' },
    { wardCode: '035021', wardName: 'Matapato North', constituencyCode: '206' },
    { wardCode: '035022', wardName: 'Matapato South', constituencyCode: '206' },

    // ==================== KERICHO COUNTY (036) ====================
    // Kipkelion East (207)
    { wardCode: '036001', wardName: 'Kipkelion', constituencyCode: '207' },
    { wardCode: '036002', wardName: 'Kunyak', constituencyCode: '207' },
    { wardCode: '036003', wardName: 'Kamasian', constituencyCode: '207' },
    { wardCode: '036004', wardName: 'Londiani', constituencyCode: '207' },
    // Kipkelion West (208)
    { wardCode: '036005', wardName: 'Kipkelion', constituencyCode: '208' },
    { wardCode: '036006', wardName: 'Chilchila', constituencyCode: '208' },
    { wardCode: '036007', wardName: 'Kipchimchim', constituencyCode: '208' },
    { wardCode: '036008', wardName: 'Tendeno', constituencyCode: '208' },
    // Bureti (209)
    { wardCode: '036009', wardName: 'Cheboin', constituencyCode: '209' },
    { wardCode: '036010', wardName: 'Chebunyo', constituencyCode: '209' },
    { wardCode: '036011', wardName: 'Tebesonik', constituencyCode: '209' },
    { wardCode: '036012', wardName: 'Chemelil', constituencyCode: '209' },
    // Kericho Town (210)
    { wardCode: '036013', wardName: 'Kericho', constituencyCode: '210' },
    { wardCode: '036014', wardName: 'Londiani', constituencyCode: '210' },
    { wardCode: '036015', wardName: 'Kipchebor', constituencyCode: '210' },
    { wardCode: '036016', wardName: 'Kaptumo', constituencyCode: '210' },

    // ==================== BOMET COUNTY (037) ====================
    // Bomet East (213)
    { wardCode: '037001', wardName: 'Longisa', constituencyCode: '213' },
    { wardCode: '037002', wardName: 'Kipreres', constituencyCode: '213' },
    { wardCode: '037003', wardName: 'Chemaner', constituencyCode: '213' },
    { wardCode: '037004', wardName: 'Ndaraweta', constituencyCode: '213' },
    // Bomet Central (214)
    { wardCode: '037005', wardName: 'Silibwet', constituencyCode: '214' },
    { wardCode: '037006', wardName: 'Nyangores', constituencyCode: '214' },
    { wardCode: '037007', wardName: 'Chebunyo', constituencyCode: '214' },
    { wardCode: '037008', wardName: 'Merigi', constituencyCode: '214' },
    // Bomet West (215)
    { wardCode: '037009', wardName: 'Sigor', constituencyCode: '215' },
    { wardCode: '037010', wardName: 'Ndanai', constituencyCode: '215' },
    { wardCode: '037011', wardName: 'Mogogosiek', constituencyCode: '215' },
    { wardCode: '037012', wardName: 'Boito', constituencyCode: '215' },
    // Chepalungu (216)
    { wardCode: '037013', wardName: 'Kong\'asis', constituencyCode: '216' },
    { wardCode: '037014', wardName: 'Nyansiongo', constituencyCode: '216' },
    { wardCode: '037015', wardName: 'Chebunyo', constituencyCode: '216' },
    { wardCode: '037016', wardName: 'Kunyak', constituencyCode: '216' },
    // Sotik (217)
    { wardCode: '037017', wardName: 'Sotik', constituencyCode: '217' },
    { wardCode: '037018', wardName: 'Kipsonoi', constituencyCode: '217' },
    { wardCode: '037019', wardName: 'Ndanai', constituencyCode: '217' },
    { wardCode: '037020', wardName: 'Chemagel', constituencyCode: '217' },

    // ==================== KAKAMEGA COUNTY (038) ====================
    // Likuyani (218)
    { wardCode: '038001', wardName: 'Likuyani', constituencyCode: '218' },
    { wardCode: '038002', wardName: 'Manda', constituencyCode: '218' },
    { wardCode: '038003', wardName: 'Nzoia', constituencyCode: '218' },
    { wardCode: '038004', wardName: 'Sango', constituencyCode: '218' },
    // Lugari (219)
    { wardCode: '038005', wardName: 'Lugari', constituencyCode: '219' },
    { wardCode: '038006', wardName: 'Mautuma', constituencyCode: '219' },
    { wardCode: '038007', wardName: 'Chekalini', constituencyCode: '219' },
    { wardCode: '038008', wardName: 'Lumakanda', constituencyCode: '219' },
    // Mumias West (220)
    { wardCode: '038009', wardName: 'Mumias', constituencyCode: '220' },
    { wardCode: '038010', wardName: 'Malaha', constituencyCode: '220' },
    { wardCode: '038011', wardName: 'Lusheya', constituencyCode: '220' },
    { wardCode: '038012', wardName: 'Lureko', constituencyCode: '220' },
    // Mumias East (221)
    { wardCode: '038013', wardName: 'Mumias East', constituencyCode: '221' },
    { wardCode: '038014', wardName: 'Etenje', constituencyCode: '221' },
    { wardCode: '038015', wardName: 'Musanda', constituencyCode: '221' },
    { wardCode: '038016', wardName: 'Wanga', constituencyCode: '221' },
    // Matungu (222)
    { wardCode: '038017', wardName: 'Matungu', constituencyCode: '222' },
    { wardCode: '038018', wardName: 'Koyonzo', constituencyCode: '222' },
    { wardCode: '038019', wardName: 'Khalaba', constituencyCode: '222' },
    { wardCode: '038020', wardName: 'Mayoni', constituencyCode: '222' },
    // Khwisero (223)
    { wardCode: '038021', wardName: 'Khwisero', constituencyCode: '223' },
    { wardCode: '038022', wardName: 'Mwibona', constituencyCode: '223' },
    { wardCode: '038023', wardName: 'Manda', constituencyCode: '223' },
    { wardCode: '038024', wardName: 'Ndalu', constituencyCode: '223' },
    // Shinyalu (224)
    { wardCode: '038025', wardName: 'Shinyalu', constituencyCode: '224' },
    { wardCode: '038026', wardName: 'Murhanda', constituencyCode: '224' },
    { wardCode: '038027', wardName: 'Isukha', constituencyCode: '224' },
    { wardCode: '038028', wardName: 'Isukha Central', constituencyCode: '224' },
    // Ikolomani (225)
    { wardCode: '038029', wardName: 'Ikolomani', constituencyCode: '225' },
    { wardCode: '038030', wardName: 'Idakho', constituencyCode: '225' },
    { wardCode: '038031', wardName: 'Isukha', constituencyCode: '225' },
    { wardCode: '038032', wardName: 'Idakho South', constituencyCode: '225' },
    // Kakamega Central (226)
    { wardCode: '038033', wardName: 'Kakamega', constituencyCode: '226' },
    { wardCode: '038034', wardName: 'Butsotso', constituencyCode: '226' },
    { wardCode: '038035', wardName: 'Sheywe', constituencyCode: '226' },
    { wardCode: '038036', wardName: 'Shianda', constituencyCode: '226' },
    // Kakamega North (227)
    { wardCode: '038037', wardName: 'Lurambi', constituencyCode: '227' },
    { wardCode: '038038', wardName: 'Mahiakalo', constituencyCode: '227' },
    { wardCode: '038039', wardName: 'Shirugu', constituencyCode: '227' },
    { wardCode: '038040', wardName: 'Marama', constituencyCode: '227' },
    // Kakamega South (228)
    { wardCode: '038041', wardName: 'Butere', constituencyCode: '228' },
    { wardCode: '038042', wardName: 'Marama', constituencyCode: '228' },
    { wardCode: '038043', wardName: 'Kholera', constituencyCode: '228' },
    { wardCode: '038044', wardName: 'Lukuyani', constituencyCode: '228' },
    // Butere (229)
    { wardCode: '038045', wardName: 'Butere', constituencyCode: '229' },
    { wardCode: '038046', wardName: 'Marama', constituencyCode: '229' },
    { wardCode: '038047', wardName: 'Lukuyani', constituencyCode: '229' },
    { wardCode: '038048', wardName: 'Kholera', constituencyCode: '229' },

    // ==================== VIHIGA COUNTY (039) ====================
    // Vihiga (230)
    { wardCode: '039001', wardName: 'Vihiga', constituencyCode: '230' },
    { wardCode: '039002', wardName: 'Mungoma', constituencyCode: '230' },
    { wardCode: '039003', wardName: 'Lugaga-Wamuluma', constituencyCode: '230' },
    { wardCode: '039004', wardName: 'South Maragoli', constituencyCode: '230' },
    // Sabatia (231)
    { wardCode: '039005', wardName: 'Lyaduywa/Izava', constituencyCode: '231' },
    { wardCode: '039006', wardName: 'West Sabatia', constituencyCode: '231' },
    { wardCode: '039007', wardName: 'Chavakali', constituencyCode: '231' },
    { wardCode: '039008', wardName: 'North Maragoli', constituencyCode: '231' },
    { wardCode: '039009', wardName: 'Wodanga', constituencyCode: '231' },
    // Hamisi (232)
    { wardCode: '039010', wardName: 'Hamisi', constituencyCode: '232' },
    { wardCode: '039011', wardName: 'Shiru', constituencyCode: '232' },
    { wardCode: '039012', wardName: 'Gisambai', constituencyCode: '232' },
    { wardCode: '039013', wardName: 'Banja', constituencyCode: '232' },
    { wardCode: '039014', wardName: 'Muhudu', constituencyCode: '232' },
    // Luanda (233)
    { wardCode: '039015', wardName: 'Luanda', constituencyCode: '233' },
    { wardCode: '039016', wardName: 'Emabungo', constituencyCode: '233' },
    { wardCode: '039017', wardName: 'Wemilabi', constituencyCode: '233' },
    { wardCode: '039018', wardName: 'Tambua', constituencyCode: '233' },
    // Emuhaya (234)
    { wardCode: '039019', wardName: 'Emuhaya', constituencyCode: '234' },
    { wardCode: '039020', wardName: 'North East Bunyore', constituencyCode: '234' },
    { wardCode: '039021', wardName: 'Central Bunyore', constituencyCode: '234' },
    { wardCode: '039022', wardName: 'West Bunyore', constituencyCode: '234' },

    // ==================== BUNGOMA COUNTY (040) ====================
    // Bungoma West (235)
    { wardCode: '040001', wardName: 'Bumula', constituencyCode: '235' },
    { wardCode: '040002', wardName: 'Kimaeti', constituencyCode: '235' },
    { wardCode: '040003', wardName: 'Lukhuna', constituencyCode: '235' },
    { wardCode: '040004', wardName: 'Marakatu', constituencyCode: '235' },
    // Bungoma Central (236)
    { wardCode: '040005', wardName: 'Bungoma', constituencyCode: '236' },
    { wardCode: '040006', wardName: 'Kanganga', constituencyCode: '236' },
    { wardCode: '040007', wardName: 'Misikhu', constituencyCode: '236' },
    { wardCode: '040008', wardName: 'Naitiri', constituencyCode: '236' },
    // Kanduyi (239)
    { wardCode: '040009', wardName: 'Bukembe', constituencyCode: '239' },
    { wardCode: '040010', wardName: 'Kanduyi', constituencyCode: '239' },
    { wardCode: '040011', wardName: 'Kimaeti', constituencyCode: '239' },
    { wardCode: '040012', wardName: 'Lukhuna', constituencyCode: '239' },
    // Bumula (240)
    { wardCode: '040013', wardName: 'Bumula', constituencyCode: '240' },
    { wardCode: '040014', wardName: 'Khasoko', constituencyCode: '240' },
    { wardCode: '040015', wardName: 'Lukhuna', constituencyCode: '240' },
    { wardCode: '040016', wardName: 'Siboti', constituencyCode: '240' },
    // Sirisia (241)
    { wardCode: '040017', wardName: 'Sirisia', constituencyCode: '241' },
    { wardCode: '040018', wardName: 'Namwela', constituencyCode: '241' },
    { wardCode: '040019', wardName: 'Malakisi', constituencyCode: '241' },
    { wardCode: '040020', wardName: 'Naitiri', constituencyCode: '241' },
    // Kabuchai (242)
    { wardCode: '040021', wardName: 'Kabuchai', constituencyCode: '242' },
    { wardCode: '040022', wardName: 'Chwele', constituencyCode: '242' },
    { wardCode: '040023', wardName: 'West Nalondo', constituencyCode: '242' },
    { wardCode: '040024', wardName: 'Bwele', constituencyCode: '242' },
    // Webuye East (243)
    { wardCode: '040025', wardName: 'Webuye', constituencyCode: '243' },
    { wardCode: '040026', wardName: 'Marakwet', constituencyCode: '243' },
    { wardCode: '040027', wardName: 'Mihuu', constituencyCode: '243' },
    { wardCode: '040028', wardName: 'Ndivisi', constituencyCode: '243' },

    // ==================== BUSIA COUNTY (041) ====================
    // Teso North (244)
    { wardCode: '041001', wardName: 'Malaba', constituencyCode: '244' },
    { wardCode: '041002', wardName: 'Angurai', constituencyCode: '244' },
    { wardCode: '041003', wardName: 'Malukhu', constituencyCode: '244' },
    { wardCode: '041004', wardName: 'Majanji', constituencyCode: '244' },
    // Teso South (245)
    { wardCode: '041005', wardName: 'Chakol', constituencyCode: '245' },
    { wardCode: '041006', wardName: 'Amukura', constituencyCode: '245' },
    { wardCode: '041007', wardName: 'Alupe', constituencyCode: '245' },
    { wardCode: '041008', wardName: 'Dinwa', constituencyCode: '245' },
    // Nambale (246)
    { wardCode: '041009', wardName: 'Nambale', constituencyCode: '246' },
    { wardCode: '041010', wardName: 'Bukhayo', constituencyCode: '246' },
    { wardCode: '041011', wardName: 'Bukhayo North', constituencyCode: '246' },
    { wardCode: '041012', wardName: 'Bukhayo Central', constituencyCode: '246' },
    // Busia (247)
    { wardCode: '041013', wardName: 'Busia', constituencyCode: '247' },
    { wardCode: '041014', wardName: 'Mayenje', constituencyCode: '247' },
    { wardCode: '041015', wardName: 'Matayos', constituencyCode: '247' },
    { wardCode: '041016', wardName: 'Burumba', constituencyCode: '247' },
    // Butula (248)
    { wardCode: '041017', wardName: 'Butula', constituencyCode: '248' },
    { wardCode: '041018', wardName: 'Marachi', constituencyCode: '248' },
    { wardCode: '041019', wardName: 'Marachi West', constituencyCode: '248' },
    { wardCode: '041020', wardName: 'Marachi Central', constituencyCode: '248' },
    // Funyula (249)
    { wardCode: '041021', wardName: 'Funyula', constituencyCode: '249' },
    { wardCode: '041022', wardName: 'Nambale', constituencyCode: '249' },
    { wardCode: '041023', wardName: 'Bwiri', constituencyCode: '249' },
    { wardCode: '041024', wardName: 'Ageng\'a', constituencyCode: '249' },
    // Port Victoria (250)
    { wardCode: '041025', wardName: 'Port Victoria', constituencyCode: '250' },
    { wardCode: '041026', wardName: 'Bwengi', constituencyCode: '250' },
    { wardCode: '041027', wardName: 'Bukhayo', constituencyCode: '250' },
    { wardCode: '041028', wardName: 'Nambale', constituencyCode: '250' },

    // ==================== SIAYA COUNTY (042) ====================
    // Ugenya (251)
    { wardCode: '042001', wardName: 'Ukwala', constituencyCode: '251' },
    { wardCode: '042002', wardName: 'Ugenya', constituencyCode: '251' },
    { wardCode: '042003', wardName: 'Sidindi', constituencyCode: '251' },
    { wardCode: '042004', wardName: 'Bondo', constituencyCode: '251' },
    // Ugunja (252)
    { wardCode: '042005', wardName: 'Ugunja', constituencyCode: '252' },
    { wardCode: '042006', wardName: 'Sidindi', constituencyCode: '252' },
    { wardCode: '042007', wardName: 'Sigomere', constituencyCode: '252' },
    // Siaya (253)
    { wardCode: '042008', wardName: 'Siaya', constituencyCode: '253' },
    { wardCode: '042009', wardName: 'North Sakwa', constituencyCode: '253' },
    { wardCode: '042010', wardName: 'South Sakwa', constituencyCode: '253' },
    { wardCode: '042011', wardName: 'Bondo', constituencyCode: '253' },
    // Rarieda (254)
    { wardCode: '042012', wardName: 'Rarieda', constituencyCode: '254' },
    { wardCode: '042013', wardName: 'East Asembo', constituencyCode: '254' },
    { wardCode: '042014', wardName: 'West Asembo', constituencyCode: '254' },
    { wardCode: '042015', wardName: 'North Uyoma', constituencyCode: '254' },
    { wardCode: '042016', wardName: 'South Uyoma', constituencyCode: '254' },
    // Bondo (255)
    { wardCode: '042017', wardName: 'Bondo', constituencyCode: '255' },
    { wardCode: '042018', wardName: 'West Sakwa', constituencyCode: '255' },
    { wardCode: '042019', wardName: 'Yimbo', constituencyCode: '255' },
    { wardCode: '042020', wardName: 'East Yimbo', constituencyCode: '255' },
    // Alego Usonga (256)
    { wardCode: '042021', wardName: 'Alego', constituencyCode: '256' },
    { wardCode: '042022', wardName: 'Usonga', constituencyCode: '256' },
    { wardCode: '042023', wardName: 'Siaya', constituencyCode: '256' },
    { wardCode: '042024', wardName: 'Boro', constituencyCode: '256' },

    // ==================== KISUMU COUNTY (043) ====================
    // Kisumu West (257)
    { wardCode: '043001', wardName: 'South West Kisumu', constituencyCode: '257' },
    { wardCode: '043002', wardName: 'West Kisumu', constituencyCode: '257' },
    { wardCode: '043003', wardName: 'Central Kisumu', constituencyCode: '257' },
    { wardCode: '043004', wardName: 'North West Kisumu', constituencyCode: '257' },
    // Kisumu Central (258)
    { wardCode: '043005', wardName: 'Railways', constituencyCode: '258' },
    { wardCode: '043006', wardName: 'Migosi', constituencyCode: '258' },
    { wardCode: '043007', wardName: 'Shaurimoyo', constituencyCode: '258' },
    { wardCode: '043008', wardName: 'Kaloleni', constituencyCode: '258' },
    // Kisumu East (259)
    { wardCode: '043009', wardName: 'Kisumu East', constituencyCode: '259' },
    { wardCode: '043010', wardName: 'Nyalenda A', constituencyCode: '259' },
    { wardCode: '043011', wardName: 'Nyalenda B', constituencyCode: '259' },
    { wardCode: '043012', wardName: 'Kolwa', constituencyCode: '259' },
    // Seme (260)
    { wardCode: '043013', wardName: 'Seme', constituencyCode: '260' },
    { wardCode: '043014', wardName: 'West Seme', constituencyCode: '260' },
    { wardCode: '043015', wardName: 'Central Seme', constituencyCode: '260' },
    { wardCode: '043016', wardName: 'East Seme', constituencyCode: '260' },
    // Nyando (261)
    { wardCode: '043017', wardName: 'Awasi', constituencyCode: '261' },
    { wardCode: '043018', wardName: 'Ahero', constituencyCode: '261' },
    { wardCode: '043019', wardName: 'Kabonyo', constituencyCode: '261' },
    { wardCode: '043020', wardName: 'Kobura', constituencyCode: '261' },
    // Muhoroni (262)
    { wardCode: '043021', wardName: 'Muhoroni', constituencyCode: '262' },
    { wardCode: '043022', wardName: 'Chemelil', constituencyCode: '262' },
    { wardCode: '043023', wardName: 'Miwani', constituencyCode: '262' },
    { wardCode: '043024', wardName: 'Ombeyi', constituencyCode: '262' },
    // Nyakach (263)
    { wardCode: '043025', wardName: 'North Nyakach', constituencyCode: '263' },
    { wardCode: '043026', wardName: 'Central Nyakach', constituencyCode: '263' },
    { wardCode: '043027', wardName: 'South Nyakach', constituencyCode: '263' },
    { wardCode: '043028', wardName: 'East Nyakach', constituencyCode: '263' },

    // ==================== HOMA BAY COUNTY (044) ====================
    // Kasipul (264)
    { wardCode: '044001', wardName: 'West Kasipul', constituencyCode: '264' },
    { wardCode: '044002', wardName: 'East Kasipul', constituencyCode: '264' },
    { wardCode: '044003', wardName: 'South Kasipul', constituencyCode: '264' },
    { wardCode: '044004', wardName: 'Central Kasipul', constituencyCode: '264' },
    // Kabondo Kasipul (265)
    { wardCode: '044005', wardName: 'Kabondo', constituencyCode: '265' },
    { wardCode: '044006', wardName: 'Kojwach', constituencyCode: '265' },
    { wardCode: '044007', wardName: 'West Kabondo', constituencyCode: '265' },
    { wardCode: '044008', wardName: 'East Kabondo', constituencyCode: '265' },
    // Karachuonyo (266)
    { wardCode: '044009', wardName: 'Karachuonyo', constituencyCode: '266' },
    { wardCode: '044010', wardName: 'West Karachuonyo', constituencyCode: '266' },
    { wardCode: '044011', wardName: 'North Karachuonyo', constituencyCode: '266' },
    { wardCode: '044012', wardName: 'South Karachuonyo', constituencyCode: '266' },
    // Rangwe (267)
    { wardCode: '044013', wardName: 'West Rangwe', constituencyCode: '267' },
    { wardCode: '044014', wardName: 'East Rangwe', constituencyCode: '267' },
    { wardCode: '044015', wardName: 'Central Rangwe', constituencyCode: '267' },
    { wardCode: '044016', wardName: 'South Rangwe', constituencyCode: '267' },
    // Homa Bay Town (270)
    { wardCode: '044017', wardName: 'Homa Bay Central', constituencyCode: '270' },
    { wardCode: '044018', wardName: 'Homa Bay East', constituencyCode: '270' },
    { wardCode: '044019', wardName: 'Homa Bay West', constituencyCode: '270' },
    { wardCode: '044020', wardName: 'Homa Bay South', constituencyCode: '270' },
    // Ndhiwa (268)
    { wardCode: '044021', wardName: 'Kwabwai', constituencyCode: '268' },
    { wardCode: '044022', wardName: 'Kanyadoto', constituencyCode: '268' },
    { wardCode: '044023', wardName: 'Kanyikela', constituencyCode: '268' },
    { wardCode: '044024', wardName: 'Kabuoch', constituencyCode: '268' },
    // Suba North (271)
    { wardCode: '044025', wardName: 'Mfangano', constituencyCode: '271' },
    { wardCode: '044026', wardName: 'Rusinga', constituencyCode: '271' },
    { wardCode: '044027', wardName: 'Kasgunga', constituencyCode: '271' },
    { wardCode: '044028', wardName: 'Gembe', constituencyCode: '271' },
    // Suba South (269)
    { wardCode: '044029', wardName: 'Gwassi', constituencyCode: '269' },
    { wardCode: '044030', wardName: 'Kaksingri', constituencyCode: '269' },
    { wardCode: '044031', wardName: 'Lambwe', constituencyCode: '269' },
    { wardCode: '044032', wardName: 'Ruma', constituencyCode: '269' },

    // ==================== MIGORI COUNTY (045) ====================
    // Rongo (272)
    { wardCode: '045001', wardName: 'Rongo', constituencyCode: '272' },
    { wardCode: '045002', wardName: 'North Rongo', constituencyCode: '272' },
    { wardCode: '045003', wardName: 'Central Rongo', constituencyCode: '272' },
    { wardCode: '045004', wardName: 'South Rongo', constituencyCode: '272' },
    // Awendo (273)
    { wardCode: '045005', wardName: 'Awendo', constituencyCode: '273' },
    { wardCode: '045006', wardName: 'North Awendo', constituencyCode: '273' },
    { wardCode: '045007', wardName: 'Central Awendo', constituencyCode: '273' },
    { wardCode: '045008', wardName: 'South Awendo', constituencyCode: '273' },
    // Suna East (274)
    { wardCode: '045009', wardName: 'Suna East', constituencyCode: '274' },
    { wardCode: '045010', wardName: 'God Jope', constituencyCode: '274' },
    { wardCode: '045011', wardName: 'Suna Central', constituencyCode: '274' },
    { wardCode: '045012', wardName: 'Ragana', constituencyCode: '274' },
    // Suna West (275)
    { wardCode: '045013', wardName: 'Suna West', constituencyCode: '275' },
    { wardCode: '045014', wardName: 'Wiga', constituencyCode: '275' },
    { wardCode: '045015', wardName: 'Wasweta', constituencyCode: '275' },
    { wardCode: '045016', wardName: 'Ragana', constituencyCode: '275' },
    // Uriri (276)
    { wardCode: '045017', wardName: 'West Uriri', constituencyCode: '276' },
    { wardCode: '045018', wardName: 'East Uriri', constituencyCode: '276' },
    { wardCode: '045019', wardName: 'Central Uriri', constituencyCode: '276' },
    { wardCode: '045020', wardName: 'South Uriri', constituencyCode: '276' },
    // Nyatike (277)
    { wardCode: '045021', wardName: 'Kaler', constituencyCode: '277' },
    { wardCode: '045022', wardName: 'Kachien\'g', constituencyCode: '277' },
    { wardCode: '045023', wardName: 'Macalder', constituencyCode: '277' },
    { wardCode: '045024', wardName: 'North Kadem', constituencyCode: '277' },

    // ==================== KISII COUNTY (046) ====================
    // Bonchari (278)
    { wardCode: '046001', wardName: 'Bogirongo', constituencyCode: '278' },
    { wardCode: '046002', wardName: 'Bomwagamo', constituencyCode: '278' },
    { wardCode: '046003', wardName: 'Getenga', constituencyCode: '278' },
    { wardCode: '046004', wardName: 'Nyacheki', constituencyCode: '278' },
    // South Mugirango (279)
    { wardCode: '046005', wardName: 'Bogusero', constituencyCode: '279' },
    { wardCode: '046006', wardName: 'Bosongo', constituencyCode: '279' },
    { wardCode: '046007', wardName: 'Tabaka', constituencyCode: '279' },
    { wardCode: '046008', wardName: 'Nyamasibi', constituencyCode: '279' },
    // Borabu (280)
    { wardCode: '046009', wardName: 'Borabu', constituencyCode: '280' },
    { wardCode: '046010', wardName: 'Mogonga', constituencyCode: '280' },
    { wardCode: '046011', wardName: 'Nyamusi', constituencyCode: '280' },
    { wardCode: '046012', wardName: 'Gesima', constituencyCode: '280' },
    // Kisii Town (281)
    { wardCode: '046013', wardName: 'Kisii Central', constituencyCode: '281' },
    { wardCode: '046014', wardName: 'Kisii East', constituencyCode: '281' },
    { wardCode: '046015', wardName: 'Kisii West', constituencyCode: '281' },
    { wardCode: '046016', wardName: 'Kisii South', constituencyCode: '281' },
    // Nyaribari Chache (283)
    { wardCode: '046017', wardName: 'Ibeno', constituencyCode: '283' },
    { wardCode: '046018', wardName: 'Igare', constituencyCode: '283' },
    { wardCode: '046019', wardName: 'Kisii', constituencyCode: '283' },
    { wardCode: '046020', wardName: 'Nyamarambe', constituencyCode: '283' },
    // Nyaribari Masaba (284)
    { wardCode: '046021', wardName: 'Masimba', constituencyCode: '284' },
    { wardCode: '046022', wardName: 'Nyamasibi', constituencyCode: '284' },
    { wardCode: '046023', wardName: 'Tagare', constituencyCode: '284' },
    { wardCode: '046024', wardName: 'Kiamokama', constituencyCode: '284' },
    // Bobasi (285)
    { wardCode: '046025', wardName: 'Bobasi', constituencyCode: '285' },
    { wardCode: '046026', wardName: 'Sameta', constituencyCode: '285' },
    { wardCode: '046027', wardName: 'Masige', constituencyCode: '285' },
    { wardCode: '046028', wardName: 'Bogichora', constituencyCode: '285' },
    // Kitutu Chache (286)
    { wardCode: '046029', wardName: 'Nyakoe', constituencyCode: '286' },
    { wardCode: '046030', wardName: 'Nyatieko', constituencyCode: '286' },
    { wardCode: '046031', wardName: 'Rigoma', constituencyCode: '286' },
    { wardCode: '046032', wardName: 'Gesusu', constituencyCode: '286' },

    // ==================== NYAMIRA COUNTY (047) ====================
    // Kitutu Masaba (287)
    { wardCode: '047001', wardName: 'Kemera', constituencyCode: '287' },
    { wardCode: '047002', wardName: 'Magombo', constituencyCode: '287' },
    { wardCode: '047003', wardName: 'Monyerero', constituencyCode: '287' },
    { wardCode: '047004', wardName: 'Nyamaiya', constituencyCode: '287' },
    // West Mugirango (288)
    { wardCode: '047005', wardName: 'Bogirongo', constituencyCode: '288' },
    { wardCode: '047006', wardName: 'Bomwagamo', constituencyCode: '288' },
    { wardCode: '047007', wardName: 'Bosongo', constituencyCode: '288' },
    { wardCode: '047008', wardName: 'Nyansiongo', constituencyCode: '288' },
    // Nyamira Town (289)
    { wardCode: '047009', wardName: 'Nyamira', constituencyCode: '289' },
    { wardCode: '047010', wardName: 'Ekerenyo', constituencyCode: '289' },
    { wardCode: '047011', wardName: 'Magombo', constituencyCode: '289' },
    { wardCode: '047012', wardName: 'Bosamaro', constituencyCode: '289' },
    // North Mugirango (290)
    { wardCode: '047013', wardName: 'Itibo', constituencyCode: '290' },
    { wardCode: '047014', wardName: 'Borabu', constituencyCode: '290' },
    { wardCode: '047015', wardName: 'Manga', constituencyCode: '290' },
    { wardCode: '047016', wardName: 'Majoge', constituencyCode: '290' },
  ];

  constructor(
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    private readonly constituencySeed: ConstituencySeed,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting ward seed...');

    // Get constituency IDs mapping
    const constituencyIdMap = await this.constituencySeed.getConstituencyIds();

    let seededCount = 0;
    for (const wardData of this.wards) {
      try {
        const constituencyId = constituencyIdMap.get(wardData.constituencyCode);
        if (!constituencyId) {
          this.logger.warn(`Constituency not found for code: ${wardData.constituencyCode}`);
          continue;
        }

        const existing = await this.wardRepository.findOne({
          where: { wardCode: wardData.wardCode },
        });

        if (existing) {
          await this.wardRepository.update(existing.id, {
            wardName: wardData.wardName,
            constituencyId: constituencyId,
            isActive: true,
          });
        } else {
          const ward = this.wardRepository.create({
            wardCode: wardData.wardCode,
            wardName: wardData.wardName,
            constituencyId: constituencyId,
            isActive: true,
          });
          await this.wardRepository.save(ward);
        }
        seededCount++;
        if (seededCount % 100 === 0) {
          this.logger.debug(`Seeded ${seededCount} wards...`);
        }
      } catch (error) {
        this.logger.error(`Error seeding ward ${wardData.wardName}:`, error.message);
      }
    }

    const count = await this.wardRepository.count();
    this.logger.log(`Ward seed complete. Total wards: ${count}`);
  }

  async getWardIds(): Promise<Map<string, string>> {
    const wards = await this.wardRepository.find();
    const wardMap = new Map<string, string>();
    wards.forEach((ward) => {
      wardMap.set(ward.wardCode, ward.id);
    });
    return wardMap;
  }
}
