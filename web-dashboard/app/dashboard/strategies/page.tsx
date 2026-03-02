'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const data = await api.getServiceStrategiesByCategory();
      setStrategies(data);
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(strategies);
  const displayCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(c => c === selectedCategory);

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      behavioral_support: '',
      communication: '',
      social_skills: '',
      daily_living: '',
      vocational: '',
      health_wellness: '',
      community_integration: ''
    };
    return icons[category] || '';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Service Strategies</h1>
        <p className="text-gray-600 mt-1">Reference library of evidence-based support strategies</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {getCategoryIcon(category)} {formatCategoryName(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Strategies List */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading strategies...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayCategories.map((category) => (
            <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  {formatCategoryName(category)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {strategies[category]?.length || 0} strategies available
                </p>
              </div>
              <div className="divide-y">
                {strategies[category]?.map((strategy: any) => (
                  <div key={strategy.id} className="p-4 hover:bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {strategy.name}
                    </h3>
                    {strategy.description && (
                      <p className="text-gray-600 text-sm">{strategy.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
