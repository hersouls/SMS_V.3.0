import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, serviceName }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-default border-white/20">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white-force text-xl-ko font-semibold tracking-ko-normal break-keep-ko">
            구독 삭제
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover-button min-w-[44px] min-h-[44px] focus-ring"
            aria-label="모달 닫기"
            disabled={isDeleting}
            title="모달 닫기"
          >
            <X size={18} className="icon-enhanced" aria-hidden="true" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-4 text-4xl">🗑️</div>
            <p className="mb-4 text-base-ko text-white-force tracking-ko-normal break-keep-ko">
              <strong>{serviceName}</strong> 구독을 삭제하시겠습니까?
            </p>
            <p className="text-sm-ko text-white/70 tracking-ko-normal break-keep-ko">
              이 작업은 되돌릴 수 없으며, 모든 구독 정보가 영구적으로 삭제됩니다.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 hover-button touch-target text-base-ko font-medium tracking-ko-normal focus-ring"
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm} 
              className="flex-1 hover-button touch-target text-base-ko font-medium tracking-ko-normal focus-ring"
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}