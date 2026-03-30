import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constituency } from '../../entities/constituency.entity';
import { CountySeed } from './county.seed';

interface ConstituencyData {
  constituencyCode: string;
  constituencyName: string;
  countyCode: string;
}

@Injectable()
export class ConstituencySeed {
  private readonly logger = new Logger(ConstituencySeed.name);

  // All 290 Kenyan constituencies with their IEBC codes
  private readonly constituencies: ConstituencyData[] = [
    // Nairobi County (001) - 17 constituencies
    { constituencyCode: '001', constituencyName: 'Starehe', countyCode: '001' },
    { constituencyCode: '002', constituencyName: 'Kasarani', countyCode: '001' },
    { constituencyCode: '003', constituencyName: 'Ruaraka', countyCode: '001' },
    { constituencyCode: '004', constituencyName: 'Dagoretti North', countyCode: '001' },
    { constituencyCode: '005', constituencyName: 'Dagoretti South', countyCode: '001' },
    { constituencyCode: '006', constituencyName: 'Westlands', countyCode: '001' },
    { constituencyCode: '007', constituencyName: 'Parklands', countyCode: '001' },
    { constituencyCode: '008', constituencyName: 'Kibra', countyCode: '001' },
    { constituencyCode: '009', constituencyName: 'Roysy Samba', countyCode: '001' },
    { constituencyCode: '010', constituencyName: 'Roysambu', countyCode: '001' },
    { constituencyCode: '011', constituencyName: 'Kasarani', countyCode: '001' },
    { constituencyCode: '012', constituencyName: 'Njiru', countyCode: '001' },
    { constituencyCode: '013', constituencyName: 'Ruaraka', countyCode: '001' },
    { constituencyCode: '014', constituencyName: 'Langata', countyCode: '001' },
    { constituencyCode: '015', constituencyName: 'Dagoretti', countyCode: '001' },
    { constituencyCode: '016', constituencyName: 'Westlands', countyCode: '001' },
    { constituencyCode: '017', constituencyName: 'Embakasi', countyCode: '001' },
    
    // Mombasa County (002) - 6 constituencies
    { constituencyCode: '018', constituencyName: 'Kisauni', countyCode: '002' },
    { constituencyCode: '019', constituencyName: 'Nyali', countyCode: '002' },
    { constituencyCode: '020', constituencyName: 'Changamwe', countyCode: '002' },
    { constituencyCode: '021', constituencyName: 'Jomvu', countyCode: '002' },
    { constituencyCode: '022', constituencyName: 'Tudor', countyCode: '002' },
    { constituencyCode: '023', constituencyName: 'Mombasa Central', countyCode: '002' },

    // Kwale County (003) - 4 constituencies
    { constituencyCode: '024', constituencyName: 'Msambweni', countyCode: '003' },
    { constituencyCode: '025', constituencyName: 'Kinango', countyCode: '003' },
    { constituencyCode: '026', constituencyName: 'Matuga', countyCode: '003' },
    { constituencyCode: '027', constituencyName: 'Lunga Lunga', countyCode: '003' },

    // Kilifi County (004) - 6 constituencies
    { constituencyCode: '028', constituencyName: 'Kilifi North', countyCode: '004' },
    { constituencyCode: '029', constituencyName: 'Kilifi South', countyCode: '004' },
    { constituencyCode: '030', constituencyName: 'Malindi', countyCode: '004' },
    { constituencyCode: '031', constituencyName: 'Magarini', countyCode: '004' },
    { constituencyCode: '032', constituencyName: 'Kaloleni', countyCode: '004' },
    { constituencyCode: '033', constituencyName: 'Rabai', countyCode: '004' },

    // Tana River County (005) - 3 constituencies
    { constituencyCode: '034', constituencyName: 'Garsen', countyCode: '005' },
    { constituencyCode: '035', constituencyName: 'Galole', countyCode: '005' },
    { constituencyCode: '036', constituencyName: 'Bura', countyCode: '005' },

    // Lamu County (006) - 2 constituencies
    { constituencyCode: '037', constituencyName: 'Lamu East', countyCode: '006' },
    { constituencyCode: '038', constituencyName: 'Lamu West', countyCode: '006' },

    // Taita-Taveta (007) - 4 constituencies
    { constituencyCode: '039', constituencyName: 'Taveta', countyCode: '007' },
    { constituencyCode: '040', constituencyName: 'Wundanyi', countyCode: '007' },
    { constituencyCode: '041', constituencyName: 'Mwatate', countyCode: '007' },
    { constituencyCode: '042', constituencyName: 'Voi', countyCode: '007' },

    // Garissa County (008) - 6 constituencies
    { constituencyCode: '043', constituencyName: 'Garissa Township', countyCode: '008' },
    { constituencyCode: '044', constituencyName: 'Balambala', countyCode: '008' },
    { constituencyCode: '045', constituencyName: 'Lagdera', countyCode: '008' },
    { constituencyCode: '046', constituencyName: 'Daadab', countyCode: '008' },
    { constituencyCode: '047', constituencyName: 'Fafi', countyCode: '008' },
    { constituencyCode: '048', constituencyName: 'Ijara', countyCode: '008' },

    // Wajir County (009) - 6 constituencies
    { constituencyCode: '049', constituencyName: 'Wajir North', countyCode: '009' },
    { constituencyCode: '050', constituencyName: 'Wajir East', countyCode: '009' },
    { constituencyCode: '051', constituencyName: 'Wajir West', countyCode: '009' },
    { constituencyCode: '052', constituencyName: 'Wajir South', countyCode: '009' },
    { constituencyCode: '053', constituencyName: 'Tarbaj', countyCode: '009' },
    { constituencyCode: '054', constituencyName: 'Eldas', countyCode: '009' },

    // Mandera County (010) - 6 constituencies
    { constituencyCode: '055', constituencyName: 'Mandera West', countyCode: '010' },
    { constituencyCode: '056', constituencyName: 'Mandera North', countyCode: '010' },
    { constituencyCode: '057', constituencyName: 'Mandera East', countyCode: '010' },
    { constituencyCode: '058', constituencyName: 'Banissa', countyCode: '010' },
    { constituencyCode: '059', constituencyName: 'Lafey', countyCode: '010' },
    { constituencyCode: '060', constituencyName: 'Mandera South', countyCode: '010' },

    // Marsabit County (011) - 4 constituencies
    { constituencyCode: '061', constituencyName: 'Moyale', countyCode: '011' },
    { constituencyCode: '062', constituencyName: 'North Horr', countyCode: '011' },
    { constituencyCode: '063', constituencyName: 'Saku', countyCode: '011' },
    { constituencyCode: '064', constituencyName: 'Laisamis', countyCode: '011' },

    // Isiolo County (012) - 2 constituencies
    { constituencyCode: '065', constituencyName: 'Isiolo North', countyCode: '012' },
    { constituencyCode: '066', constituencyName: 'Isiolo South', countyCode: '012' },

    // Meru County (013) - 9 constituencies
    { constituencyCode: '067', constituencyName: 'Igembe North', countyCode: '013' },
    { constituencyCode: '068', constituencyName: 'Igembe Central', countyCode: '013' },
    { constituencyCode: '069', constituencyName: 'Igembe South', countyCode: '013' },
    { constituencyCode: '070', constituencyName: 'Tigania West', countyCode: '013' },
    { constituencyCode: '071', constituencyName: 'Tigania East', countyCode: '013' },
    { constituencyCode: '072', constituencyName: 'North Meru', countyCode: '013' },
    { constituencyCode: '073', constituencyName: 'South Meru', countyCode: '013' },
    { constituencyCode: '074', constituencyName: 'Central Imenti', countyCode: '013' },
    { constituencyCode: '075', constituencyName: 'Buuri', countyCode: '013' },

    // Tharaka-Nithi (014) - 3 constituencies
    { constituencyCode: '076', constituencyName: 'Maara', countyCode: '014' },
    { constituencyCode: '077', constituencyName: 'Chuka/Igamba', countyCode: '014' },
    { constituencyCode: '078', constituencyName: 'Tharaka', countyCode: '014' },

    // Embu County (015) - 4 constituencies
    { constituencyCode: '079', constituencyName: 'Manyatta', countyCode: '015' },
    { constituencyCode: '080', constituencyName: 'Runyenjes', countyCode: '015' },
    { constituencyCode: '081', constituencyName: 'Embu West', countyCode: '015' },
    { constituencyCode: '082', constituencyName: 'Embu East', countyCode: '015' },

    // Kitui County (016) - 8 constituencies
    { constituencyCode: '083', constituencyName: 'Kitui West', countyCode: '016' },
    { constituencyCode: '084', constituencyName: 'Kitui Central', countyCode: '016' },
    { constituencyCode: '085', constituencyName: 'Kitui East', countyCode: '016' },
    { constituencyCode: '086', constituencyName: 'Kitui South', countyCode: '016' },
    { constituencyCode: '087', constituencyName: 'Kitui Rural', countyCode: '016' },
    { constituencyCode: '088', constituencyName: 'Mwingi North', countyCode: '016' },
    { constituencyCode: '089', constituencyName: 'Mwingi West', countyCode: '016' },
    { constituencyCode: '090', constituencyName: 'Mwingi Central', countyCode: '016' },

    // Machakos County (017) - 10 constituencies
    { constituencyCode: '091', constituencyName: 'Mavoko', countyCode: '017' },
    { constituencyCode: '092', constituencyName: 'Machakos Town', countyCode: '017' },
    { constituencyCode: '093', constituencyName: 'Masinga', countyCode: '017' },
    { constituencyCode: '094', constituencyName: 'Yatta', countyCode: '017' },
    { constituencyCode: '095', constituencyName: 'Ndalani', countyCode: '017' },
    { constituencyCode: '096', constituencyName: 'Kibwezi', countyCode: '017' },
    { constituencyCode: '097', constituencyName: 'Kibwezi West', countyCode: '017' },
    { constituencyCode: '098', constituencyName: 'Kalama', countyCode: '017' },
    { constituencyCode: '099', constituencyName: 'Kangundo', countyCode: '017' },
    { constituencyCode: '100', constituencyName: 'Matungulu', countyCode: '017' },

    // Makueni County (018) - 6 constituencies
    { constituencyCode: '101', constituencyName: 'Makueni', countyCode: '018' },
    { constituencyCode: '102', constituencyName: 'Kibwezi East', countyCode: '018' },
    { constituencyCode: '103', constituencyName: 'Kibwezi West', countyCode: '018' },
    { constituencyCode: '104', constituencyName: 'Kilome', countyCode: '018' },
    { constituencyCode: '105', constituencyName: 'Kaiti', countyCode: '018' },
    { constituencyCode: '106', constituencyName: 'Mbooni', countyCode: '018' },

    // Nyandarua County (019) - 5 constituencies
    { constituencyCode: '107', constituencyName: 'Kinangop', countyCode: '019' },
    { constituencyCode: '108', constituencyName: 'Nyandarua North', countyCode: '019' },
    { constituencyCode: '109', constituencyName: 'Nyandarua West', countyCode: '019' },
    { constituencyCode: '110', constituencyName: 'Nyandarua South', countyCode: '019' },
    { constituencyCode: '111', constituencyName: 'Ol Kalou', countyCode: '019' },

    // Nyeri County (020) - 7 constituencies
    { constituencyCode: '112', constituencyName: 'Tetu', countyCode: '020' },
    { constituencyCode: '113', constituencyName: 'Kieni', countyCode: '020' },
    { constituencyCode: '114', constituencyName: 'Mkurweni', countyCode: '020' },
    { constituencyCode: '115', constituencyName: 'Othaya', countyCode: '020' },
    { constituencyCode: '116', constituencyName: 'Mwea', countyCode: '020' },
    { constituencyCode: '117', constituencyName: 'Nyeri Town', countyCode: '020' },
    { constituencyCode: '118', constituencyName: 'Mathira', countyCode: '020' },

    // Kirinyaga County (021) - 4 constituencies
    { constituencyCode: '119', constituencyName: 'Kirinyaga Central', countyCode: '021' },
    { constituencyCode: '120', constituencyName: 'Kirinyaga East', countyCode: '021' },
    { constituencyCode: '121', constituencyName: 'Kirinyaga West', countyCode: '021' },
    { constituencyCode: '122', constituencyName: 'Mwea', countyCode: '021' },

    // Murang'a County (022) - 7 constituencies
    { constituencyCode: '123', constituencyName: 'Kangema', countyCode: '022' },
    { constituencyCode: '124', constituencyName: 'Mathioya', countyCode: '022' },
    { constituencyCode: '125', constituencyName: 'Kigumo', countyCode: '022' },
    { constituencyCode: '126', constituencyName: 'Maragwa', countyCode: '022' },
    { constituencyCode: '127', constituencyName: 'Dondo', countyCode: '022' },
    { constituencyCode: '128', constituencyName: 'Gatanga', countyCode: '022' },
    { constituencyCode: '129', constituencyName: 'Kandara', countyCode: '022' },

    // Kiambu County (023) - 12 constituencies
    { constituencyCode: '130', constituencyName: 'Githunguri', countyCode: '023' },
    { constituencyCode: '131', constituencyName: 'Ruiru', countyCode: '023' },
    { constituencyCode: '132', constituencyName: 'Juja', countyCode: '023' },
    { constituencyCode: '133', constituencyName: 'Thika Town', countyCode: '023' },
    { constituencyCode: '134', constituencyName: 'Kiambu', countyCode: '023' },
    { constituencyCode: '135', constituencyName: 'Kiambu District', countyCode: '023' },
    { constituencyCode: '136', constituencyName: 'Limuru', countyCode: '023' },
    { constituencyCode: '137', constituencyName: 'Tukuyu', countyCode: '023' },
    { constituencyCode: '138', constituencyName: 'Kabete', countyCode: '023' },
    { constituencyCode: '139', constituencyName: 'Kikuyu', countyCode: '023' },
    { constituencyCode: '140', constituencyName: 'Ndeiya', countyCode: '023' },
    { constituencyCode: '141', constituencyName: 'Gatundu South', countyCode: '023' },

    // Turkana County (024) - 6 constituencies
    { constituencyCode: '142', constituencyName: 'Turkana North', countyCode: '024' },
    { constituencyCode: '143', constituencyName: 'Turkana West', countyCode: '024' },
    { constituencyCode: '144', constituencyName: 'Turkana Central', countyCode: '024' },
    { constituencyCode: '145', constituencyName: 'Loima', countyCode: '024' },
    { constituencyCode: '146', constituencyName: 'Turkana South', countyCode: '024' },
    { constituencyCode: '147', constituencyName: 'Turkana East', countyCode: '024' },

    // West Pokot County (025) - 4 constituencies
    { constituencyCode: '148', constituencyName: 'Kapenguria', countyCode: '025' },
    { constituencyCode: '149', constituencyName: 'Sigor', countyCode: '025' },
    { constituencyCode: '150', constituencyName: 'Kacheliba', countyCode: '025' },
    { constituencyCode: '151', constituencyName: 'Pokot South', countyCode: '025' },

    // Samburu County (026) - 3 constituencies
    { constituencyCode: '152', constituencyName: 'Samburu West', countyCode: '026' },
    { constituencyCode: '153', constituencyName: 'Samburu North', countyCode: '026' },
    { constituencyCode: '154', constituencyName: 'Samburu East', countyCode: '026' },

    // Trans-Nzoia County (027) - 5 constituencies
    { constituencyCode: '155', constituencyName: 'Kwanza', countyCode: '027' },
    { constituencyCode: '156', constituencyName: 'Endebess', countyCode: '027' },
    { constituencyCode: '157', constituencyName: 'Kiminini', countyCode: '027' },
    { constituencyCode: '158', constituencyName: 'Saboti', countyCode: '027' },
    { constituencyCode: '159', constituencyName: 'Cherangany', countyCode: '027' },

    // Uasin Gishu County (028) - 6 constituencies
    { constituencyCode: '160', constituencyName: 'Soy', countyCode: '028' },
    { constituencyCode: '161', constituencyName: 'Turbo', countyCode: '028' },
    { constituencyCode: '162', constituencyName: 'Moiben', countyCode: '028' },
    { constituencyCode: '163', constituencyName: 'Kesses', countyCode: '028' },
    { constituencyCode: '164', constituencyName: 'Kapseret', countyCode: '028' },
    { constituencyCode: '165', constituencyName: 'Kipkelion', countyCode: '028' },

    // Elgeyo-Marakwet County (029) - 4 constituencies
    { constituencyCode: '166', constituencyName: 'Marakwet East', countyCode: '029' },
    { constituencyCode: '167', constituencyName: 'Marakwet West', countyCode: '029' },
    { constituencyCode: '168', constituencyName: 'Keiyo North', countyCode: '029' },
    { constituencyCode: '169', constituencyName: 'Keiyo South', countyCode: '029' },

    // Nandi County (030) - 6 constituencies
    { constituencyCode: '170', constituencyName: 'Nandi Hills', countyCode: '030' },
    { constituencyCode: '171', constituencyName: 'Emgwen', countyCode: '030' },
    { constituencyCode: '172', constituencyName: 'Chesumei', countyCode: '030' },
    { constituencyCode: '173', constituencyName: 'Aldai', countyCode: '030' },
    { constituencyCode: '174', constituencyName: 'Kabianga', countyCode: '030' },
    { constituencyCode: '175', constituencyName: 'Mosop', countyCode: '030' },

    // Baringo County (031) - 6 constituencies
    { constituencyCode: '176', constituencyName: 'Baringo North', countyCode: '031' },
    { constituencyCode: '177', constituencyName: 'Baringo Central', countyCode: '031' },
    { constituencyCode: '178', constituencyName: 'Baringo South', countyCode: '031' },
    { constituencyCode: '179', constituencyName: 'Mogotio', countyCode: '031' },
    { constituencyCode: '180', constituencyName: 'Eldama Ravine', countyCode: '031' },
    { constituencyCode: '181', constituencyName: 'Koibatek', countyCode: '031' },

    // Laikipia County (032) - 3 constituencies
    { constituencyCode: '182', constituencyName: 'Laikipia West', countyCode: '032' },
    { constituencyCode: '183', constituencyName: 'Laikipia East', countyCode: '032' },
    { constituencyCode: '184', constituencyName: 'Laikipia North', countyCode: '032' },

    // Nakuru County (033) - 11 constituencies
    { constituencyCode: '185', constituencyName: 'Molo', countyCode: '033' },
    { constituencyCode: '186', constituencyName: 'Njoro', countyCode: '033' },
    { constituencyCode: '187', constituencyName: 'Naivasha', countyCode: '033' },
    { constituencyCode: '188', constituencyName: 'Gilgil', countyCode: '033' },
    { constituencyCode: '189', constituencyName: 'Kiptagwas', countyCode: '033' },
    { constituencyCode: '190', constituencyName: 'Rongai', countyCode: '033' },
    { constituencyCode: '191', constituencyName: 'Subukia', countyCode: '033' },
    { constituencyCode: '192', constituencyName: 'Kasinin', countyCode: '033' },
    { constituencyCode: '193', constituencyName: 'Kipipiri', countyCode: '033' },
    { constituencyCode: '194', constituencyName: 'Wanyororo', countyCode: '033' },
    { constituencyCode: '195', constituencyName: 'Bahati', countyCode: '033' },

    // Narok County (034) - 6 constituencies
    { constituencyCode: '196', constituencyName: 'Narok North', countyCode: '034' },
    { constituencyCode: '197', constituencyName: 'Narok West', countyCode: '034' },
    { constituencyCode: '198', constituencyName: 'Narok South', countyCode: '034' },
    { constituencyCode: '199', constituencyName: 'Narok East', countyCode: '034' },
    { constituencyCode: '200', constituencyName: 'Kajiado Central', countyCode: '034' },
    { constituencyCode: '201', constituencyName: 'Kajiado West', countyCode: '034' },

    // Kajiado County (035) - 5 constituencies
    { constituencyCode: '202', constituencyName: 'Kajiado Central', countyCode: '035' },
    { constituencyCode: '203', constituencyName: 'Kajiado East', countyCode: '035' },
    { constituencyCode: '204', constituencyName: 'Kajiado North', countyCode: '035' },
    { constituencyCode: '205', constituencyName: 'Kajiado West', countyCode: '035' },
    { constituencyCode: '206', constituencyName: 'Isinya', countyCode: '035' },

    // Kericho County (036) - 6 constituencies
    { constituencyCode: '207', constituencyName: 'Kipkelion East', countyCode: '036' },
    { constituencyCode: '208', constituencyName: 'Kipkelion West', countyCode: '036' },
    { constituencyCode: '209', constituencyName: 'Bureti', countyCode: '036' },
    { constituencyCode: '210', constituencyName: 'Kericho Town', countyCode: '036' },
    { constituencyCode: '211', constituencyName: 'Kipchimchim', countyCode: '036' },
    { constituencyCode: '212', constituencyName: 'Londiani', countyCode: '036' },

    // Bomet County (037) - 5 constituencies
    { constituencyCode: '213', constituencyName: 'Bomet East', countyCode: '037' },
    { constituencyCode: '214', constituencyName: 'Bomet Central', countyCode: '037' },
    { constituencyCode: '215', constituencyName: 'Bomet West', countyCode: '037' },
    { constituencyCode: '216', constituencyName: 'Chepalungu', countyCode: '037' },
    { constituencyCode: '217', constituencyName: 'Sotik', countyCode: '037' },

    // Kakamega County (038) - 12 constituencies
    { constituencyCode: '218', constituencyName: 'Likuyani', countyCode: '038' },
    { constituencyCode: '219', constituencyName: 'Lugari', countyCode: '038' },
    { constituencyCode: '220', constituencyName: 'Mumias West', countyCode: '038' },
    { constituencyCode: '221', constituencyName: 'Mumias East', countyCode: '038' },
    { constituencyCode: '222', constituencyName: 'Matungu', countyCode: '038' },
    { constituencyCode: '223', constituencyName: 'Khwisero', countyCode: '038' },
    { constituencyCode: '224', constituencyName: 'Shinyalu', countyCode: '038' },
    { constituencyCode: '225', constituencyName: 'Ikolomani', countyCode: '038' },
    { constituencyCode: '226', constituencyName: 'Kakamega Central', countyCode: '038' },
    { constituencyCode: '227', constituencyName: 'Kakamega North', countyCode: '038' },
    { constituencyCode: '228', constituencyName: 'Kakamega South', countyCode: '038' },
    { constituencyCode: '229', constituencyName: 'Butere', countyCode: '038' },

    // Vihiga County (039) - 5 constituencies
    { constituencyCode: '230', constituencyName: 'Vihiga', countyCode: '039' },
    { constituencyCode: '231', constituencyName: 'Sabatia', countyCode: '039' },
    { constituencyCode: '232', constituencyName: 'Hamisi', countyCode: '039' },
    { constituencyCode: '233', constituencyName: 'Luanda', countyCode: '039' },
    { constituencyCode: '234', constituencyName: 'Emuhaya', countyCode: '039' },

    // Bungoma County (040) - 9 constituencies
    { constituencyCode: '235', constituencyName: 'Bungoma West', countyCode: '040' },
    { constituencyCode: '236', constituencyName: 'Bungoma Central', countyCode: '040' },
    { constituencyCode: '237', constituencyName: 'Bungoma North', countyCode: '040' },
    { constituencyCode: '238', constituencyName: 'Bungoma East', countyCode: '040' },
    { constituencyCode: '239', constituencyName: 'Kanduyi', countyCode: '040' },
    { constituencyCode: '240', constituencyName: 'Bumula', countyCode: '040' },
    { constituencyCode: '241', constituencyName: 'Sirisia', countyCode: '040' },
    { constituencyCode: '242', constituencyName: 'Kabuchai', countyCode: '040' },
    { constituencyCode: '243', constituencyName: 'Webuye East', countyCode: '040' },

    // Busia County (041) - 7 constituencies
    { constituencyCode: '244', constituencyName: 'Teso North', countyCode: '041' },
    { constituencyCode: '245', constituencyName: 'Teso South', countyCode: '041' },
    { constituencyCode: '246', constituencyName: 'Nambale', countyCode: '041' },
    { constituencyCode: '247', constituencyName: 'Busia', countyCode: '041' },
    { constituencyCode: '248', constituencyName: 'Butula', countyCode: '041' },
    { constituencyCode: '249', constituencyName: 'Funyula', countyCode: '041' },
    { constituencyCode: '250', constituencyName: 'Port Victoria', countyCode: '041' },

    // Siaya County (042) - 6 constituencies
    { constituencyCode: '251', constituencyName: 'Ugenya', countyCode: '042' },
    { constituencyCode: '252', constituencyName: 'Ugunja', countyCode: '042' },
    { constituencyCode: '253', constituencyName: 'Siaya', countyCode: '042' },
    { constituencyCode: '254', constituencyName: 'Rarieda', countyCode: '042' },
    { constituencyCode: '255', constituencyName: 'Bondo', countyCode: '042' },
    { constituencyCode: '256', constituencyName: 'Alego Usonga', countyCode: '042' },

    // Kisumu County (043) - 7 constituencies
    { constituencyCode: '257', constituencyName: 'Kisumu West', countyCode: '043' },
    { constituencyCode: '258', constituencyName: 'Kisumu Central', countyCode: '043' },
    { constituencyCode: '259', constituencyName: 'Kisumu East', countyCode: '043' },
    { constituencyCode: '260', constituencyName: 'Seme', countyCode: '043' },
    { constituencyCode: '261', constituencyName: 'Nyando', countyCode: '043' },
    { constituencyCode: '262', constituencyName: 'Muhoroni', countyCode: '043' },
    { constituencyCode: '263', constituencyName: 'Nyakach', countyCode: '043' },

    // Homa Bay County (044) - 8 constituencies
    { constituencyCode: '264', constituencyName: 'Kasipul', countyCode: '044' },
    { constituencyCode: '265', constituencyName: 'Kabondo Kasipul', countyCode: '044' },
    { constituencyCode: '266', constituencyName: 'Karachuonyo', countyCode: '044' },
    { constituencyCode: '267', constituencyName: 'Kanyamkago', countyCode: '044' },
    { constituencyCode: '268', constituencyName: 'Rongo', countyCode: '044' },
    { constituencyCode: '269', constituencyName: 'Awendo', countyCode: '044' },
    { constituencyCode: '270', constituencyName: 'Homa Bay Town', countyCode: '044' },
    { constituencyCode: '271', constituencyName: 'Mfangano', countyCode: '044' },

    // Migori County (045) - 6 constituencies
    { constituencyCode: '272', constituencyName: 'Rongo', countyCode: '045' },
    { constituencyCode: '273', constituencyName: 'Awendo', countyCode: '045' },
    { constituencyCode: '274', constituencyName: 'Suna East', countyCode: '045' },
    { constituencyCode: '275', constituencyName: 'Suna West', countyCode: '045' },
    { constituencyCode: '276', constituencyName: 'Uriri', countyCode: '045' },
    { constituencyCode: '277', constituencyName: 'Nyatike', countyCode: '045' },

    // Kisii County (046) - 9 constituencies
    { constituencyCode: '278', constituencyName: 'Bonchari', countyCode: '046' },
    { constituencyCode: '279', constituencyName: 'South Mugirango', countyCode: '046' },
    { constituencyCode: '280', constituencyName: 'Borabu', countyCode: '046' },
    { constituencyCode: '281', constituencyName: 'Kisii Town', countyCode: '046' },
    { constituencyCode: '282', constituencyName: 'Kisii Central', countyCode: '046' },
    { constituencyCode: '283', constituencyName: 'Nyaribari Chache', countyCode: '046' },
    { constituencyCode: '284', constituencyName: 'Nyaribari Masaba', countyCode: '046' },
    { constituencyCode: '285', constituencyName: 'Bobaracho', countyCode: '046' },
    { constituencyCode: '286', constituencyName: 'Gucha', countyCode: '046' },

    // Nyamira County (047) - 5 constituencies
    { constituencyCode: '287', constituencyName: 'Kitutu Masaba', countyCode: '047' },
    { constituencyCode: '288', constituencyName: 'West Mugirango', countyCode: '047' },
    { constituencyCode: '289', constituencyName: 'Nyamira Town', countyCode: '047' },
    { constituencyCode: '290', constituencyName: 'North Mugirango', countyCode: '047' },
  ];

  constructor(
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
    private readonly countySeed: CountySeed,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting constituency seed...');

    // Get county IDs mapping
    const countyIdMap = await this.countySeed.getCountyIds();

    for (const constituencyData of this.constituencies) {
      try {
        const countyId = countyIdMap.get(constituencyData.countyCode);
        if (!countyId) {
          this.logger.warn(`County not found for code: ${constituencyData.countyCode}`);
          continue;
        }

        const existing = await this.constituencyRepository.findOne({
          where: { constituencyCode: constituencyData.constituencyCode },
        });

        if (existing) {
          await this.constituencyRepository.update(existing.id, {
            constituencyName: constituencyData.constituencyName,
            countyId: countyId,
            isActive: true,
          });
          this.logger.debug(`Updated constituency: ${constituencyData.constituencyName}`);
        } else {
          const constituency = this.constituencyRepository.create({
            constituencyCode: constituencyData.constituencyCode,
            constituencyName: constituencyData.constituencyName,
            countyId: countyId,
            isActive: true,
          });
          await this.constituencyRepository.save(constituency);
          this.logger.debug(`Inserted constituency: ${constituencyData.constituencyName}`);
        }
      } catch (error) {
        this.logger.error(
          `Error seeding constituency ${constituencyData.constituencyName}:`,
          error.message,
        );
      }
    }

    const count = await this.constituencyRepository.count();
    this.logger.log(`Constituency seed complete. Total constituencies: ${count}`);
  }

  async getConstituencyIds(): Promise<Map<string, string>> {
    const constituencies = await this.constituencyRepository.find();
    const constituencyMap = new Map<string, string>();
    constituencies.forEach((constituency) => {
      constituencyMap.set(constituency.constituencyCode, constituency.id);
    });
    return constituencyMap;
  }
}
