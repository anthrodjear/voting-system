import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { County } from '../../entities/county.entity';

interface CountyData {
  countyCode: string;
  countyName: string;
  region: string;
  capital: string;
  areaSqKm: number;
  population: number;
}

@Injectable()
export class CountySeed {
  private readonly logger = new Logger(CountySeed.name);

  // Official IEBC codes for all 47 Kenyan counties
  private readonly counties: CountyData[] = [
    { countyCode: '001', countyName: 'Nairobi', region: 'Central', capital: 'Nairobi', areaSqKm: 696, population: 4397073 },
    { countyCode: '002', countyName: 'Mombasa', region: 'Coast', capital: 'Mombasa', areaSqKm: 219, population: 1208330 },
    { countyCode: '003', countyName: 'Kwale', region: 'Coast', capital: 'Kwale', areaSqKm: 8270, population: 866820 },
    { countyCode: '004', countyName: 'Kilifi', region: 'Coast', capital: 'Kilifi', areaSqKm: 12245, population: 1456780 },
    { countyCode: '005', countyName: 'Tana River', region: 'Coast', capital: 'Hola', areaSqKm: 38037, population: 315943 },
    { countyCode: '006', countyName: 'Lamu', region: 'Coast', capital: 'Lamu', areaSqKm: 6493, population: 143920 },
    { countyCode: '007', countyName: 'Taita-Taveta', region: 'Coast', capital: 'Wundanyi', areaSqKm: 17083, population: 340671 },
    { countyCode: '008', countyName: 'Garissa', region: 'North Eastern', capital: 'Garissa', areaSqKm: 44313, population: 691776 },
    { countyCode: '009', countyName: 'Wajir', region: 'North Eastern', capital: 'Wajir', areaSqKm: 56084, population: 661941 },
    { countyCode: '010', countyName: 'Mandera', region: 'North Eastern', capital: 'Mandera', areaSqKm: 46717, population: 867457 },
    { countyCode: '011', countyName: 'Marsabit', region: 'Eastern', capital: 'Marsabit', areaSqKm: 66923, population: 459785 },
    { countyCode: '012', countyName: 'Isiolo', region: 'Eastern', capital: 'Isiolo', areaSqKm: 25336, population: 268002 },
    { countyCode: '013', countyName: 'Meru', region: 'Eastern', capital: 'Meru', areaSqKm: 7061, population: 1545620 },
    { countyCode: '014', countyName: 'Tharaka-Nithi', region: 'Eastern', capital: 'Chuka', areaSqKm: 2638, population: 393177 },
    { countyCode: '015', countyName: 'Embu', region: 'Eastern', capital: 'Embu', areaSqKm: 2817, population: 487315 },
    { countyCode: '016', countyName: 'Kitui', region: 'Eastern', capital: 'Kitui', areaSqKm: 30384, population: 1138640 },
    { countyCode: '017', countyName: 'Machakos', region: 'Eastern', capital: 'Machakos', areaSqKm: 6206, population: 1421656 },
    { countyCode: '018', countyName: 'Makueni', region: 'Eastern', capital: 'Wote', areaSqKm: 8009, population: 987653 },
    { countyCode: '019', countyName: 'Nyandarua', region: 'Central', capital: 'Ol Kalou', areaSqKm: 3107, population: 638289 },
    { countyCode: '020', countyName: 'Nyeri', region: 'Central', capital: 'Nyeri', areaSqKm: 2837, population: 759164 },
    { countyCode: '021', countyName: 'Kirinyaga', region: 'Central', capital: 'Kutus', areaSqKm: 1205, population: 610411 },
    { countyCode: '022', countyName: 'Murang\'a', region: 'Central', capital: 'Murang\'a', areaSqKm: 2325, population: 1038652 },
    { countyCode: '023', countyName: 'Kiambu', region: 'Central', capital: 'Kiambu', areaSqKm: 2449, population: 2038331 },
    { countyCode: '024', countyName: 'Turkana', region: 'Rift Valley', capital: 'Lodwar', areaSqKm: 71598, population: 926976 },
    { countyCode: '025', countyName: 'West Pokot', region: 'Rift Valley', capital: 'Kapenguria', areaSqKm: 8827, population: 621241 },
    { countyCode: '026', countyName: 'Samburu', region: 'Rift Valley', capital: 'Maralal', areaSqKm: 20152, population: 310327 },
    { countyCode: '027', countyName: 'Trans-Nzoia', region: 'Rift Valley', capital: 'Kitale', areaSqKm: 2498, population: 990341 },
    { countyCode: '028', countyName: 'Uasin Gishu', region: 'Rift Valley', capital: 'Eldoret', areaSqKm: 3345, population: 1207750 },
    { countyCode: '029', countyName: 'Elgeyo-Marakwet', region: 'Rift Valley', capital: 'Iten', areaSqKm: 3045, population: 369998 },
    { countyCode: '030', countyName: 'Nandi', region: 'Rift Valley', capital: 'Kapsabet', areaSqKm: 2884, population: 885711 },
    { countyCode: '031', countyName: 'Baringo', region: 'Rift Valley', capital: 'Kabarnet', areaSqKm: 11073, population: 666763 },
    { countyCode: '032', countyName: 'Laikipia', region: 'Rift Valley', capital: 'Rumuruti', areaSqKm: 8696, population: 518560 },
    { countyCode: '033', countyName: 'Nakuru', region: 'Rift Valley', capital: 'Nakuru', areaSqKm: 7509, population: 2317545 },
    { countyCode: '034', countyName: 'Narok', region: 'Rift Valley', capital: 'Narok', areaSqKm: 17242, population: 1158030 },
    { countyCode: '035', countyName: 'Kajiado', region: 'Rift Valley', capital: 'Kajiado', areaSqKm: 21375, population: 799065 },
    { countyCode: '036', countyName: 'Kericho', region: 'Rift Valley', capital: 'Kericho', areaSqKm: 2453, population: 901177 },
    { countyCode: '037', countyName: 'Bomet', region: 'Rift Valley', capital: 'Bomet', areaSqKm: 2603, population: 875083 },
    { countyCode: '038', countyName: 'Kakamega', region: 'Western', capital: 'Kakamega', areaSqKm: 3047, population: 1765690 },
    { countyCode: '039', countyName: 'Vihiga', region: 'Western', capital: 'Vihiga', areaSqKm: 531, population: 590013 },
    { countyCode: '040', countyName: 'Bungoma', region: 'Western', capital: 'Bungoma', areaSqKm: 2207, population: 1683931 },
    { countyCode: '041', countyName: 'Busia', region: 'Western', capital: 'Busia', areaSqKm: 3265, population: 893681 },
    { countyCode: '042', countyName: 'Siaya', region: 'Nyanza', capital: 'Siaya', areaSqKm: 2630, population: 985440 },
    { countyCode: '043', countyName: 'Kisumu', region: 'Nyanza', capital: 'Kisumu', areaSqKm: 2085, population: 1116910 },
    { countyCode: '044', countyName: 'Homa Bay', region: 'Nyanza', capital: 'Homa Bay', areaSqKm: 3264, population: 1038840 },
    { countyCode: '045', countyName: 'Migori', region: 'Nyanza', capital: 'Migori', areaSqKm: 2616, population: 1101820 },
    { countyCode: '046', countyName: 'Kisii', region: 'Nyanza', capital: 'Kisii', areaSqKm: 2190, population: 1380291 },
    { countyCode: '047', countyName: 'Nyamira', region: 'Nyanza', capital: 'Nyamira', areaSqKm: 2990, population: 605576 },
  ];

  constructor(
    @InjectRepository(County)
    private readonly countyRepository: Repository<County>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting county seed...');

    for (const countyData of this.counties) {
      try {
        const existing = await this.countyRepository.findOne({
          where: { countyCode: countyData.countyCode },
        });

        if (existing) {
          // Update existing county
          await this.countyRepository.update(existing.id, {
            countyName: countyData.countyName,
            region: countyData.region,
            capital: countyData.capital,
            areaSqKm: countyData.areaSqKm,
            population: countyData.population,
            isActive: true,
          });
          this.logger.debug(`Updated county: ${countyData.countyName}`);
        } else {
          // Insert new county
          const county = this.countyRepository.create({
            countyCode: countyData.countyCode,
            countyName: countyData.countyName,
            region: countyData.region,
            capital: countyData.capital,
            areaSqKm: countyData.areaSqKm,
            population: countyData.population,
            isActive: true,
          });
          await this.countyRepository.save(county);
          this.logger.debug(`Inserted county: ${countyData.countyName}`);
        }
      } catch (error) {
        this.logger.error(`Error seeding county ${countyData.countyName}:`, error.message);
      }
    }

    const count = await this.countyRepository.count();
    this.logger.log(`County seed complete. Total counties: ${count}`);
  }

  async getCountyIds(): Promise<Map<string, string>> {
    const counties = await this.countyRepository.find();
    const countyMap = new Map<string, string>();
    counties.forEach((county) => {
      countyMap.set(county.countyCode, county.id);
    });
    return countyMap;
  }
}
