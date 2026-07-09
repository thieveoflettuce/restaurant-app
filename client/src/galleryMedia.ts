export const GALLERY_PHOTOS: string[] = [
  'photo-1.JPG',
  'photo-2.JPG',
  'photo-3.JPG',
  'photo-4.JPG',
  'photo-5.JPG',
  'photo-6.JPG',
  'photo-7.JPG',
  'photo-8.JPG',
  'photo-9.JPG',
  'photo-10.JPG',
  'photo-11.JPG',
  'photo-12.JPG',
  'photo-13.JPG',
  'photo-14.JPG',
  'photo-15.JPG',
  'photo-16.jpg',
];

export const GALLERY_VIDEOS = ['gallery1.mp4', 'gallery2.mp4'];

export const HOME_GALLERY_PHOTOS = GALLERY_PHOTOS.slice(0, 6);

export function galleryPhotoUrl(filename: string) {
  return `${process.env.PUBLIC_URL}/gallery/${filename}`;
}

export function galleryVideoUrl(filename: string) {
  return `${process.env.PUBLIC_URL}/gallery/${filename}`;
}
