export class RecentAnimalDto {
  constructor(partial: Partial<RecentAnimalDto>) {
    Object.assign(this, partial);
  }
  id: number;
  type: 'missing' | 'found';
  animalType: string;
  breed: string;
  location: string;
  date: string;
  image: string;
  user: {
    name: string;
    // profileImage?: string;
  };
}