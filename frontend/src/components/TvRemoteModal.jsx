import { useState, useEffect } from "react";
import { useTvRemoteStore } from "../store/tvRemoteStore";
import { useAuthStore } from "../store/authStore";
import { devicesApi, tvRemoteApi } from "../services/api";
import { 
  TbPower, TbVolume2, TbVolumeOff, TbVolume, 
  TbChevronUp, TbChevronDown, TbChevronLeft, TbChevronRight
} from "react-icons/tb";
import Modal from "./ui/modal";

const TvRemoteModal = () => {
  const { isOpen, close } = useTvRemoteStore();
  const { user } = useAuthStore();
  
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [tvStatus, setTvStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      const res = await devicesApi.list();
      let availableDevices = res.data.data || res.data;
      
      // Filter for cashier: only show devices that are in_use
      if (user?.role === 'cashier') {
        availableDevices = availableDevices.filter(d => d.status === 'in_use');
      }
      
      setDevices(availableDevices);
      if (availableDevices.length > 0) {
        handleSelectDevice(availableDevices[0]);
      } else {
        setSelectedDevice(null);
        setTvStatus(null);
      }
    } catch (err) {
      setError("Gagal memuat daftar perangkat.");
    }
  };

  const handleSelectDevice = async (device) => {
    setSelectedDevice(device);
    setTvStatus(null);
    if (!device) return;
    
    try {
      const res = await tvRemoteApi.status(device.id);
      setTvStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendCommand = async (key) => {
    if (!selectedDevice) return;
    setIsLoading(true);
    setError(null);
    try {
      await tvRemoteApi.sendKey(selectedDevice.id, key);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim perintah.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendPower = async (action) => {
    if (!selectedDevice || user?.role !== 'owner') return;
    setIsLoading(true);
    setError(null);
    try {
      await tvRemoteApi.power(selectedDevice.id, action);
      setTimeout(() => handleSelectDevice(selectedDevice), 3000); // refresh status after 3s
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah daya.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Remote TV"
      size="sm"
      className="dark !bg-gray-900 !border !border-gray-700 text-white overflow-hidden"
    >
      <div className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Device Selector */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Pilih Perangkat</label>
            <select 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors"
              value={selectedDevice?.id || ""}
              onChange={(e) => handleSelectDevice(devices.find(d => d.id == e.target.value))}
            >
              <option value="" disabled>-- Pilih Perangkat --</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.name} {d.tv ? `(${d.tv})` : ""}</option>
              ))}
            </select>
            {tvStatus && (
              <div className={`mt-2 text-xs flex items-center gap-2 ${tvStatus.online ? 'text-green-400' : 'text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full ${tvStatus.online ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {tvStatus.online ? 'TV Online' : 'TV Offline'}
              </div>
            )}
            {devices.length === 0 && (
              <p className="mt-2 text-xs text-amber-400">Tidak ada perangkat yang aktif saat ini.</p>
            )}
          </div>

          {/* Remote Body */}
          <div className="flex flex-col items-center gap-6 opacity-90 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 rounded-2xl backdrop-blur-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {/* Top Row: Power & Source */}
            <div className="flex justify-between w-full px-4">
              <button 
                onClick={() => sendPower(tvStatus?.online ? 'OFF' : 'ON')}
                disabled={!selectedDevice || user?.role !== 'owner'}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                  ${user?.role !== 'owner' ? 'opacity-20 cursor-not-allowed bg-gray-800' : 'bg-red-600 hover:bg-red-500'}`}
                title={user?.role !== 'owner' ? "Hanya owner yang bisa mematikan/menyalakan TV" : "Power"}
              >
                <TbPower className="size-6 text-white" />
              </button>
              
              <button 
                onClick={() => sendCommand('KEY_SOURCE')}
                disabled={!selectedDevice}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-xs font-semibold tracking-wider border border-gray-700 transition-colors"
              >
                SOURCE
              </button>
            </div>

            {/* Nav D-Pad */}
            <div className="relative w-48 h-48 bg-gray-800 rounded-full border border-gray-700 shadow-inner flex items-center justify-center">
              <button onClick={() => sendCommand('KEY_UP')} className="absolute top-2 w-16 h-12 flex justify-center items-start pt-2 hover:text-blue-400 transition-colors">
                <TbChevronUp className="size-8" />
              </button>
              <button onClick={() => sendCommand('KEY_DOWN')} className="absolute bottom-2 w-16 h-12 flex justify-center items-end pb-2 hover:text-blue-400 transition-colors">
                <TbChevronDown className="size-8" />
              </button>
              <button onClick={() => sendCommand('KEY_LEFT')} className="absolute left-2 w-12 h-16 flex justify-start items-center pl-2 hover:text-blue-400 transition-colors">
                <TbChevronLeft className="size-8" />
              </button>
              <button onClick={() => sendCommand('KEY_RIGHT')} className="absolute right-2 w-12 h-16 flex justify-end items-center pr-2 hover:text-blue-400 transition-colors">
                <TbChevronRight className="size-8" />
              </button>
              <button onClick={() => sendCommand('KEY_ENTER')} className="w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all active:scale-90">
                OK
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="flex gap-4 w-full justify-center">
              <div className="flex flex-col items-center bg-gray-800 rounded-full p-2 border border-gray-700">
                <button onClick={() => sendCommand('KEY_VOLUP')} className="p-3 hover:bg-gray-700 rounded-full transition-colors"><TbVolume2 className="size-5" /></button>
                <span className="text-[10px] font-bold text-gray-400 my-1">VOL</span>
                <button onClick={() => sendCommand('KEY_VOLDOWN')} className="p-3 hover:bg-gray-700 rounded-full transition-colors"><TbVolume className="size-5" /></button>
              </div>
              
              <div className="flex flex-col justify-center gap-4">
                <button onClick={() => sendCommand('KEY_HOME')} className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700 text-xs font-bold transition-transform active:scale-95">
                  HOME
                </button>
                <button onClick={() => sendCommand('KEY_MUTE')} className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700 transition-transform active:scale-95">
                  <TbVolumeOff className="size-5" />
                </button>
              </div>

              <div className="flex flex-col items-center bg-gray-800 rounded-full p-2 border border-gray-700">
                <button onClick={() => sendCommand('KEY_CHUP')} className="p-3 hover:bg-gray-700 rounded-full transition-colors"><TbChevronUp className="size-5" /></button>
                <span className="text-[10px] font-bold text-gray-400 my-1">CH</span>
                <button onClick={() => sendCommand('KEY_CHDOWN')} className="p-3 hover:bg-gray-700 rounded-full transition-colors"><TbChevronDown className="size-5" /></button>
              </div>
            </div>
          </div>

      </div>
    </Modal>
  );
};

export default TvRemoteModal;
