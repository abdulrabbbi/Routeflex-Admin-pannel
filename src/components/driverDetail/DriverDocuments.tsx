import { useMemo, useRef, useState } from "react";
import { FiFileText, FiCheck } from "react-icons/fi";
import { getSignedUrl, looksLikeImage, s3UrlToKey } from "../../utils/s3";
import DocumentPreviewModal from "../DocumentPreviewModal";

type Props = {
  documents: Record<string, string>;
  labels?: Record<string, string>;
};

const defaultLabels: Record<string, string> = {
  driverLicenseFront: "Driver License (Front)",
  driverLicenseBack: "Driver License (Back)",
  vehicleInsurance: "Vehicle Insurance",
  goodsForHireInsurance: "Goods for Hire Insurance",
  publicLiabilityInsurance: "Public Liability Insurance",
  proofOfAddress: "Proof of Address",
  rightToWork: "Right to Work",
  nationalInsurance: "National Insurance",
  disclosureReceipt: "Disclosure Receipt",
  dvlaCheck: "DVLA Check",
};

// simple in-memory cache for signed urls this session
const signedCache = new Map<string, string>();

export default function DriverDocuments({ documents, labels = defaultLabels }: Props) {
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState<string | undefined>();
  const [isImage, setIsImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // cancel inflight (avoid setState on unmounted / race conditions)
  const abortRef = useRef<AbortController | null>(null);

  const entries = useMemo(() => Object.entries(documents || {}), [documents]);

  async function handleOpen(key: string, value: string) {
    // cancel any in-flight request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setErrMsg(null);
    setOpen(true);
    setModalUrl(undefined);
    setModalTitle(labels[key] || key);
    setLoading(true);

    try {
      const keyOrUrl = s3UrlToKey(value);
      setIsImage(looksLikeImage(keyOrUrl));

      // cache hit?
      const cached = signedCache.get(keyOrUrl);
      if (cached) {
        setModalUrl(cached);
        return;
      }

      const signed = await getSignedUrl(keyOrUrl, 300);
      if (ac.signal.aborted) return;
      signedCache.set(keyOrUrl, signed);
      setModalUrl(signed);
    } catch (e: any) {
      if (!ac.signal.aborted) setErrMsg("Could not load document.");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <div className="bg-[#f0fdf4] px-4 py-3 border-b">
          <h3 className="font-semibold text-[#22c55e] flex items-center gap-2">
            <FiFileText /> Documents
          </h3>
        </div>

        <div className="p-4">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded.</p>
          ) : (
            <ul className="grid grid-cols-1">
              {entries.map(([key, value]) => (
                <li key={key}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 rounded"
                    onClick={() => handleOpen(key, value)}
                  >
                    <span className="text-sm">{labels[key] || key}</span>
                    <span className="flex items-center gap-2">
                      <FiCheck className="text-[#22c55e] w-4 h-4" />
                      <span className="text-xs text-[#22c55e]">View</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DocumentPreviewModal
        open={open}
        onClose={() => {
          abortRef.current?.abort();
          setOpen(false);
          setErrMsg(null);
        }}
        title={modalTitle}
        url={modalUrl}
        isImage={isImage}
        loading={loading}
        error={errMsg || undefined}
      />
    </>
  );
}
