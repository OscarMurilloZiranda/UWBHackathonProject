import '../styles/globals.css'
import { useEffect, useState, useRef } from "react";

interface Bill {
  _id: string;
  bill_code: string;
  bill_summary: string;
  brainrot_summary?: string | null;
  bill_representatives: string[];
}

interface Representative {
  name: string;
  district: number;
  phone: string;
  emailUrl: string;
}

export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedRepInfo, setSelectedRepInfo] = useState<Representative | null>(null);
  const [showBrainrot, setShowBrainrot] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBills();
    fetchRepresentatives();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch(`/api/bills`);
      const data = await res.json();
      setBills(data);
      if (data.length > 0) setSelectedBill(data[0]);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchRepresentatives = async () => {
    try {
      const res = await fetch(`/api/representatives`);
      const data = await res.json();
      setRepresentatives(data);
    } catch (error) {
      console.error('Error fetching representatives:', error);
    }
  };

  const findRepInfo = (repName: string) => {
    const nameWithoutParty = repName.split(' (')[0];
    return representatives.find(r => r.name.startsWith(nameWithoutParty));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-100 via-emerald-50 to-[#f8f4e3]">
      {/* Header */}
      <header className="w-full bg-[#d6c7a1] py-4 px-8 shadow-md flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-900 tracking-wide">ClarifyAI 📜</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-emerald-800">Show Simple</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showBrainrot}
              onChange={() => setShowBrainrot(!showBrainrot)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:bg-emerald-500 transition-colors duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden max-w-6xl w-full h-[90vh]">
          {/* Sidebar */}
          <aside
            ref={sidebarRef}
            className="w-full md:w-60 bg-emerald-50 overflow-y-auto p-4 border-b md:border-b-0 md:border-r"
          >
            <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">Bills</h2>
            <div className="flex flex-col gap-4">
              {bills.map((bill) => (
                <div
                  key={bill._id}
                  onClick={() => setSelectedBill(bill)}
                  className={`p-3 rounded-md cursor-pointer transition text-center md:text-left 
                  ${
                    selectedBill?._id === bill._id
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-gray-800 hover:bg-emerald-200"
                  }`}
                >
                  <h3 className="font-bold text-sm">{bill.bill_code}</h3>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Section */}
          <section className="flex-1 p-6 md:p-8 overflow-y-auto">
            {selectedBill ? (
              <div className="flex flex-col h-full">
                <h1 className="text-3xl font-bold text-emerald-700 mb-4">{selectedBill.bill_code}</h1>

                {/* Summary */}
                <div className="mb-8">
                  <div
                    key={showBrainrot ? 'brainrot' : 'official'}
                    className="transition-opacity duration-500 ease-in-out opacity-100"
                  >
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {showBrainrot && selectedBill.brainrot_summary
                        ? selectedBill.brainrot_summary
                        : selectedBill.bill_summary}
                    </p>
                    {!selectedBill.brainrot_summary && showBrainrot && (
                      <div className="text-red-500 mt-2">No simple summary available for this bill.</div>
                    )}
                  </div>
                </div>

                {/* Representatives */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Representatives:</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {selectedBill.bill_representatives.map((rep, idx) => {
                      const repInfo = findRepInfo(rep);
                      return (
                        <li
                          key={idx}
                          className="relative cursor-pointer hover:text-emerald-700"
                          onClick={() => repInfo && setSelectedRepInfo(repInfo)}
                        >
                          👤 {rep}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                Select a bill to view details 📜
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Representative Modal */}
      {selectedRepInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl text-gray-800 relative transform scale-95 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">{selectedRepInfo.name}</h3>
            <p className="mb-2"><strong>📍 District:</strong> {selectedRepInfo.district}</p>
            <p className="mb-2"><strong>📞 Phone:</strong> {selectedRepInfo.phone}</p>
            <p><strong>📧 Email:</strong> <a href={selectedRepInfo.emailUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Contact</a></p>

            <button
              onClick={() => setSelectedRepInfo(null)}
              className="absolute top-2 right-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
