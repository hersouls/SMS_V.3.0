import { storage } from './config';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';

// 파일 업로드 함수
export const uploadFile = async (
  path: string,
  file: File,
  metadata?: { [key: string]: string }
) => {
  try {
    console.log('📤 파일 업로드 시작:', { path, fileName: file.name, size: file.size });
    
    const storageRef = ref(storage, path);
    const uploadMetadata = {
      contentType: file.type,
      customMetadata: metadata || {}
    };
    
    const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ 파일 업로드 성공:', downloadURL);
    return { url: downloadURL, path: snapshot.ref.fullPath, error: null };
  } catch (error: any) {
    console.error('❌ 파일 업로드 실패:', error);
    return { url: null, path: null, error };
  }
};

// 파일 업로드 진행률 추적
export const uploadFileWithProgress = (
  path: string,
  file: File,
  onProgress: (progress: number) => void,
  metadata?: { [key: string]: string }
) => {
  const storageRef = ref(storage, path);
  const uploadMetadata = {
    contentType: file.type,
    customMetadata: metadata || {}
  };
  
  const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);
  
  return new Promise<{ url: string; path: string }>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`📊 업로드 진행률: ${progress.toFixed(2)}%`);
        onProgress(progress);
      },
      (error) => {
        console.error('❌ 파일 업로드 실패:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('✅ 파일 업로드 완료:', downloadURL);
        resolve({
          url: downloadURL,
          path: uploadTask.snapshot.ref.fullPath
        });
      }
    );
  });
};

// 파일 삭제
export const deleteFile = async (path: string) => {
  try {
    console.log('🗑️ 파일 삭제 시도:', path);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('✅ 파일 삭제 성공');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ 파일 삭제 실패:', error);
    return { success: false, error };
  }
};

// 파일 목록 가져오기
export const listFiles = async (path: string) => {
  try {
    console.log('📂 파일 목록 조회:', path);
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        const url = await getDownloadURL(itemRef);
        
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
          size: metadata.size,
          contentType: metadata.contentType,
          created: metadata.timeCreated,
          updated: metadata.updated,
          metadata: metadata.customMetadata
        };
      })
    );
    
    console.log('✅ 파일 목록 조회 성공:', files.length);
    return { files, error: null };
  } catch (error: any) {
    console.error('❌ 파일 목록 조회 실패:', error);
    return { files: [], error };
  }
};

// 파일 메타데이터 가져오기
export const getFileMetadata = async (path: string) => {
  try {
    console.log('📋 파일 메타데이터 조회:', path);
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    
    console.log('✅ 메타데이터 조회 성공');
    return { metadata, error: null };
  } catch (error: any) {
    console.error('❌ 메타데이터 조회 실패:', error);
    return { metadata: null, error };
  }
};

// 파일 메타데이터 업데이트
export const updateFileMetadata = async (
  path: string,
  metadata: { [key: string]: string }
) => {
  try {
    console.log('✏️ 파일 메타데이터 업데이트:', path);
    const storageRef = ref(storage, path);
    
    const updatedMetadata = await updateMetadata(storageRef, {
      customMetadata: metadata
    });
    
    console.log('✅ 메타데이터 업데이트 성공');
    return { metadata: updatedMetadata, error: null };
  } catch (error: any) {
    console.error('❌ 메타데이터 업데이트 실패:', error);
    return { metadata: null, error };
  }
};

// 이미지 업로드 헬퍼 (리사이징 포함)
export const uploadImage = async (
  path: string,
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
) => {
  try {
    console.log('🖼️ 이미지 업로드 시작:', { path, fileName: file.name });
    
    // 이미지 리사이징
    const resizedFile = await resizeImage(file, maxWidth, maxHeight, quality);
    
    // 업로드
    return await uploadFile(path, resizedFile, {
      originalName: file.name,
      originalSize: file.size.toString(),
      resizedSize: resizedFile.size.toString()
    });
  } catch (error: any) {
    console.error('❌ 이미지 업로드 실패:', error);
    return { url: null, path: null, error };
  }
};

// 이미지 리사이징 함수
const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 비율 유지하면서 리사이징
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// 사용자별 스토리지 경로 생성 헬퍼
export const getUserStoragePath = (userId: string, type: 'logos' | 'avatars' | 'documents') => {
  return `users/${userId}/${type}`;
};

// 구독 로고 경로 생성 헬퍼
export const getSubscriptionLogoPath = (userId: string, subscriptionId: string, fileName: string) => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `users/${userId}/logos/${subscriptionId}_${timestamp}.${extension}`;
};

// 사용자 아바타 경로 생성 헬퍼
export const getUserAvatarPath = (userId: string, fileName: string) => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `users/${userId}/avatars/avatar_${timestamp}.${extension}`;
};