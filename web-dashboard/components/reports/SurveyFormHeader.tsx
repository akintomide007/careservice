'use client';

import { Users, Calendar, Clock, MapPin } from 'lucide-react';

interface SurveyFormHeaderProps {
  formData: any;
  setFormData: (data: any) => void;
  clients: any[];
  ispOutcomes: any[];
}

export default function SurveyFormHeader({ formData, setFormData, clients, ispOutcomes }: SurveyFormHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Service Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Selection */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Individual *
          </label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Individual --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName} {client.dddId ? `(${client.dddId})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type *
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Service Type --</option>
            <option value="Community-Based Support">Community-Based Support (CBS)</option>
            <option value="Individual Support">Individual Support (Daily Living)</option>
            <option value="Respite">Respite</option>
            <option value="Behavioral Support">Behavioral Support</option>
            <option value="Career Planning / Vocational Support">Career Planning / Vocational Support</option>
          </select>
        </div>

        {/* Service Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date of Service *
          </label>
          <input
            type="date"
            value={formData.serviceDate}
            onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Start Time *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            End Time *
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location of Service
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Home, Community Center, Local Caf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ISP Outcome */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ISP Outcome(s) Addressed
          </label>
          <select
            value={formData.ispOutcomeId}
            onChange={(e) => setFormData({ ...formData, ispOutcomeId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select ISP Outcome (Optional) --</option>
            {ispOutcomes.map(outcome => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.outcomeDescription}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
