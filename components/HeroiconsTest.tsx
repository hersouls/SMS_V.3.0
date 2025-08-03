import React from 'react';
import { Icons, HeroIcon } from './ui/heroicons';

const HeroiconsTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Heroicons 테스트</h2>
      
      {/* 기본 사용법 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 사용법</h3>
        <div className="flex items-center space-x-4">
          <HeroIcon name="HomeIcon" size={24} className="text-blue-500" />
          <HeroIcon name="UserIcon" size={32} className="text-green-500" />
          <HeroIcon name="Cog6ToothIcon" size={28} className="text-purple-500" />
        </div>
      </div>

      {/* 미리 정의된 아이콘들 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">미리 정의된 아이콘들</h3>
        <div className="grid grid-cols-6 gap-4">
          <div className="flex flex-col items-center space-y-2">
            <Icons.Home size={24} className="text-blue-500" />
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.User size={24} className="text-green-500" />
            <span className="text-xs">User</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Settings size={24} className="text-purple-500" />
            <span className="text-xs">Settings</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Plus size={24} className="text-blue-500" />
            <span className="text-xs">Plus</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Edit size={24} className="text-orange-500" />
            <span className="text-xs">Edit</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Delete size={24} className="text-red-500" />
            <span className="text-xs">Delete</span>
          </div>
        </div>
      </div>

      {/* Solid vs Outline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Solid vs Outline</h3>
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center space-y-2">
            <HeroIcon name="HeartIcon" size={32} className="text-red-500" variant="outline" />
            <span className="text-xs">Outline</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <HeroIcon name="HeartIcon" size={32} className="text-red-500" variant="solid" />
            <span className="text-xs">Solid</span>
          </div>
        </div>
      </div>

      {/* Moonwave 특화 아이콘들 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Moonwave 특화 아이콘들</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center space-y-2">
            <Icons.Wave size={32} className="text-blue-400" />
            <span className="text-xs">Wave</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Moon size={32} className="text-indigo-500" />
            <span className="text-xs">Moon</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Icons.Sun size={32} className="text-yellow-500" />
            <span className="text-xs">Sun</span>
          </div>
        </div>
      </div>

      {/* 다양한 크기 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">다양한 크기</h3>
        <div className="flex items-center space-x-4">
          <HeroIcon name="StarIcon" size={16} className="text-yellow-500" />
          <HeroIcon name="StarIcon" size={24} className="text-yellow-500" />
          <HeroIcon name="StarIcon" size={32} className="text-yellow-500" />
          <HeroIcon name="StarIcon" size={48} className="text-yellow-500" />
        </div>
      </div>

      {/* 버튼과 함께 사용 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">버튼과 함께 사용</h3>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Icons.Plus size={20} />
            <span>추가</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <Icons.Check size={20} />
            <span>확인</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            <Icons.Delete size={20} />
            <span>삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroiconsTest; 