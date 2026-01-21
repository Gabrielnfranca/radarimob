import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: { region: string; neighborhood: string; type: string }) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar bairro..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          onChange={(e) => onFilterChange({ region: '', neighborhood: e.target.value, type: '' })}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <select 
          className="flex-1 md:w-40 p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          onChange={(e) => onFilterChange({ region: e.target.value, neighborhood: '', type: '' })}
        >
          <option value="">Todas Regiões</option>
          <option value="Zona Sul">Zona Sul</option>
          <option value="Zona Oeste">Zona Oeste</option>
          <option value="Zona Leste">Zona Leste</option>
          <option value="Zona Norte">Zona Norte</option>
          <option value="Centro">Centro</option>
        </select>

        <select 
          className="flex-1 md:w-40 p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
           onChange={(e) => onFilterChange({ region: '', neighborhood: '', type: e.target.value })}
        >
          <option value="">Qualquer Tipo</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
        </select>
      </div>
    </div>
  );
};
