'use client';

interface ProgressNotePrintProps {
  note: any;
  templateType: 'cbs' | 'individual' | 'respite' | 'behavioral' | 'vocational';
}

export default function ProgressNotePrintTemplate({ note, templateType }: ProgressNotePrintProps) {
  const getTemplateTitle = () => {
    const titles = {
      cbs: 'Community-Based Support (CBS) Progress Note',
      individual: 'Individual Support (Daily Living Skills) Progress Note',
      respite: 'Respite Progress Note',
      behavioral: 'Behavioral Support Progress Note',
      vocational: 'Career Planning / Vocational Support Progress Note'
    };
    return titles[templateType];
  };

  return (
    <div className="print:block hidden">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.75in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      <div className="max-w-full mx-auto bg-white p-0 text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', lineHeight: '1.4' }}>
        {/* Professional Document Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Care Provider System</div>
              <h1 className="text-lg font-bold uppercase border-b-2 border-black pb-1">
                {getTemplateTitle()}
              </h1>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">Document ID</div>
              <div className="text-gray-600">{note.id?.substring(0, 8)}</div>
            </div>
          </div>
        </div>
        
        {/* Client Information Grid - Clean Table Format */}
        <div className="border border-black mb-6">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100" style={{ width: '20%' }}>Individual Name:</td>
                <td className="border-r border-b border-black p-2" style={{ width: '30%' }}>{note.client?.firstName} {note.client?.lastName}</td>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100" style={{ width: '20%' }}>Date of Birth:</td>
                <td className="border-b border-black p-2" style={{ width: '30%' }}>{note.client?.dateOfBirth ? new Date(note.client.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">DDD ID #:</td>
                <td className="border-r border-b border-black p-2">{note.client?.dddId || 'N/A'}</td>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Service Date:</td>
                <td className="border-b border-black p-2">{new Date(note.serviceDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Service Type:</td>
                <td className="border-r border-b border-black p-2">{note.serviceType}</td>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Service Times:</td>
                <td className="border-b border-black p-2">{note.startTime} to {note.endTime}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Location:</td>
                <td className="border-r border-b border-black p-2" colSpan={3}>{note.location || 'N/A'}</td>
              </tr>
              <tr>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Staff Member:</td>
                <td className="border-r border-b border-black p-2">{note.staff?.firstName} {note.staff?.lastName}, DSP</td>
                <td className="border-r border-b border-black p-2 font-semibold bg-gray-100">Supervisor:</td>
                <td className="border-b border-black p-2">{note.supervisor || 'N/A'}</td>
              </tr>
              <tr>
                <td className="border-r border-black p-2 font-semibold bg-gray-100">ISP Outcome(s):</td>
                <td className="border-black p-2" colSpan={3}>{note.ispOutcome?.outcomeDescription || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Section 1: Reason for Service */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 1: REASON FOR SERVICE</h2>
          </div>
          <div className="border border-t-0 border-black p-3 min-h-[80px] text-sm whitespace-pre-wrap">
            {note.reasonForService || 'N/A'}
          </div>
        </div>
        
        {/* Section 2: Objective Description of Activities */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 2: OBJECTIVE DESCRIPTION OF ACTIVITIES & SUPPORTS PROVIDED</h2>
          </div>
          
          {note.activities && note.activities.length > 0 ? (
            <div className="border border-t-0 border-black">
              {note.activities.map((activity: any, index: number) => (
                <div key={index} className="p-3 border-b border-gray-400 last:border-b-0">
                  <div className="font-bold text-sm mb-3 underline">
                    Activity #{index + 1}: {activity.taskGoal}
                  </div>
                  
                  <div className="text-xs space-y-2">
                    <div className="flex">
                      <span className="font-semibold min-w-[140px]">Task/Goal:</span>
                      <span className="flex-1">{activity.taskGoal}</span>
                    </div>
                    
                    <div className="flex">
                      <span className="font-semibold min-w-[140px]">Supports Provided:</span>
                      <span className="flex-1">{activity.supportsProvided || 'N/A'}</span>
                    </div>
                    
                    <div className="mt-2">
                      <span className="font-semibold">Prompt Level Used:</span>
                      <div className="flex gap-6 ml-6 mt-1">
                        {['Independent', 'Verbal', 'Gestural', 'Model'].map(level => (
                          <label key={level} className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={activity.promptLevel?.includes(level)}
                              readOnly
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-xs">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex mt-2">
                      <span className="font-semibold min-w-[140px]">Observation:</span>
                      <span className="flex-1">{activity.objectiveObservation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-t-0 border-black p-3 text-sm text-gray-600">
              No activities recorded
            </div>
          )}
        </div>
        
        {/* Section 3: Supports and Prompting Summary */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 3: OVERALL SUPPORTS & PROMPTING SUMMARY</h2>
          </div>
          <div className="border border-t-0 border-black p-3 min-h-[80px] text-sm whitespace-pre-wrap">
            {note.supportsProvided || 'N/A'}
          </div>
        </div>
        
        {/* Section 4: Individual Response */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 4: INDIVIDUAL RESPONSE & ENGAGEMENT</h2>
          </div>
          <div className="border border-t-0 border-black p-3">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border-r border-b border-gray-300 p-2 font-semibold bg-gray-50" style={{ width: '25%' }}>Engagement/Compliance:</td>
                  <td className="border-b border-gray-300 p-2">{note.individualResponse?.engagement || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border-r border-b border-gray-300 p-2 font-semibold bg-gray-50">Affect/Mood:</td>
                  <td className="border-b border-gray-300 p-2">{note.individualResponse?.mood || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border-r border-b border-gray-300 p-2 font-semibold bg-gray-50">Communication:</td>
                  <td className="border-b border-gray-300 p-2">{note.individualResponse?.communication || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="border-r border-gray-300 p-2 font-semibold bg-gray-50">Observed Examples:</td>
                  <td className="p-2">{note.individualResponse?.examples || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Section 5: Progress Toward Outcome */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 5: PROGRESS TOWARD ISP OUTCOME</h2>
          </div>
          <div className="border border-t-0 border-black p-3 min-h-[80px] text-sm whitespace-pre-wrap">
            {note.progressAssessment || 'N/A'}
          </div>
        </div>
        
        {/* Section 6: Safety and Dignity */}
        <div className="mb-5">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 6: SAFETY, DIGNITY & RIGHTS</h2>
          </div>
          <div className="border border-t-0 border-black p-3 min-h-[60px] text-sm whitespace-pre-wrap">
            {note.safetyDignityNotes || 'All safety, dignity, and individual rights protocols were followed during this service.'}
          </div>
        </div>
        
        {/* Section 7: Next Steps / Follow-Up */}
        <div className="mb-6">
          <div className="bg-gray-100 border border-black p-2">
            <h2 className="text-sm font-bold">SECTION 7: NEXT STEPS & FOLLOW-UP REQUIRED</h2>
          </div>
          <div className="border border-t-0 border-black p-3 min-h-[60px] text-sm whitespace-pre-wrap">
            {note.nextSteps || 'N/A'}
          </div>
        </div>
        
        {/* Professional Signature Section */}
        <div className="mt-8 pt-4 border-t-2 border-black">
          <div className="text-xs font-bold mb-3">STAFF CERTIFICATION & SIGNATURE</div>
          <div className="grid grid-cols-2 gap-8 text-xs mb-4">
            <div>
              <div className="mb-1 text-gray-700">Staff Member Name (Print):</div>
              <div className="border-b-2 border-black pb-1 min-h-[30px] flex items-end">
                {note.staff?.firstName} {note.staff?.lastName}
              </div>
            </div>
            <div>
              <div className="mb-1 text-gray-700">Credential/Title:</div>
              <div className="border-b-2 border-black pb-1 min-h-[30px] flex items-end">
                Direct Support Professional (DSP)
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="mb-1 text-gray-700">Staff Signature:</div>
              <div className="border-b-2 border-black pb-1 min-h-[40px]"></div>
            </div>
            <div>
              <div className="mb-1 text-gray-700">Date Signed:</div>
              <div className="border-b-2 border-black pb-1 min-h-[40px] flex items-end">
                {new Date(note.serviceDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs italic text-gray-700">
            I certify that the information provided in this progress note is accurate and complete to the best of my knowledge.
          </div>
        </div>
        
        {/* Document Footer */}
        <div className="mt-8 pt-4 border-t border-gray-400 text-xs text-center text-gray-600">
          <div className="font-semibold mb-1">CONFIDENTIAL DOCUMENT</div>
          <div className="mb-1">
            This document contains protected health information (PHI) under HIPAA regulations.
            Unauthorized disclosure is prohibited by law.
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Document Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}
