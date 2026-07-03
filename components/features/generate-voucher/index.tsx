"use client";

import "./index.css";
import "../e-form/index.css";
import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { FaExclamationCircle } from "react-icons/fa";
import LoadingOverlay from "@/components/commons/loading-overlay";
import Navbar from "@/components/commons/navbar";
import sensorNama from "@/lib/censor";
import {
    clearTransactionSession,
    getTransactionFormByCategory,
    TRANSACTION_CATEGORY,
    useStoredCookie,
    useStoredTransactionCategory,
} from "@/lib/transaction-storage";
import recNumbMasking from "@/lib/recnumb";

export default function GenerateVoucherComp() {
    const navigate = useRouter();
    const captureRef = useRef<HTMLDivElement | null>(null);
    const category = useStoredTransactionCategory();
    const form = useMemo(() => getTransactionFormByCategory(category), [category]);
    const reffid = useStoredCookie("reffid");
    const [loading, setLoading] = useState(false);

    const handleScreenshot = async () => {
        if (!captureRef.current) return;

        setLoading(true);

        try {
            const canvas = await html2canvas(captureRef.current, { scale: 2 });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");

            link.href = image;
            link.download = `${reffid ?? "voucher"}.jpg`;
            link.click();
        } finally {
            window.setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    };

    const backtoHome = () => {
        clearTransactionSession();
        navigate.push("/");
    };

    const isWithdraw = category === TRANSACTION_CATEGORY.WITHDRAW;

    return (
        <div className="qr-comp" ref={captureRef}>
            {loading && <LoadingOverlay />}
            <Navbar />
            <div className="card-form invisible-scrollbar">
                <div style={{ marginTop: "42px" }} className="progress-bar">
                    <div style={{ backgroundColor: "white" }} className="progress-start">
                        <div className="progress-title" style={{ color: "white" }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: "white" }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: "white" }} >Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: "white" }} className="progress-done">
                        <div className="progress-title" style={{ color: "white" }} >Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form"></div>
                </div>
                <div className="warning">
                    <FaExclamationCircle size={18} style={{ transform: "scaleX(-1)" }} />
                    <div style={{ marginLeft: "8px" }}>Sebelum menutup halaman pastikan&nbsp;<b>kode voucher</b>&nbsp; Anda telah disimpan</div>
                </div>
                <div className="card-section-qr">
                    <div className="document-qr">
                        <div className="icon-success" >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="card-qr">
                            <div className="success-text">Pengisian Form Berhasil</div>
                            <div className="success-sub">Gunakan kode voucher untuk transaksi di cabang Bank Sumut </div>
                            <div style={{ height: "auto", padding: "12px 12px", borderRadius: "12px", margin: "0 auto", maxWidth: 120, width: "100%", marginTop: "32px", border: "1px solid #0058A0" }}>
                                <QRCode
                                    size={356}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={reffid ?? ""}
                                    viewBox="0 0 256 256"
                                />
                            </div>
                            <div className="ref-box">
                                <div className="reservasi-label">Kode Voucher</div>
                                <div className="reservasi-value">{reffid ?? ""}</div>
                            </div>

                            <div className="detail-box">
                                <div style={{ display: "flex", width: "90%", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="detail-label" style={{ width: "50%" }}>Transaksi</div>
                                    <div className="detail-value" style={{ width: "50%", textAlign: "end" }}>{isWithdraw ? "Tarikan Tunai" : "Setoran Tunai"}</div>
                                </div>
                                <div style={{ display: "flex", width: "90%", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="detail-label" style={{ width: "50%" }}>Pemilik Rekening</div>
                                    <div className="detail-value" style={{ width: "50%", textAlign: "end" }}>{isWithdraw ? sensorNama(form?.["tt-name"] ?? "") : sensorNama(form?.["st-rekname"] ?? "")}</div>
                                </div>
                                 <div style={{ display: "flex", width: "90%", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="detail-label" style={{ width: "50%" }}>Nomor Rekening</div>
                                    <div className="detail-value" style={{ width: "50%", textAlign: "end" }}>{isWithdraw ? recNumbMasking(String(form?.["tt-rek"])) : recNumbMasking(String(form?.["st-rek"] ?? ""))}</div>
                                </div>
                                <div style={{ display: "flex", width: "90%", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="detail-label" style={{ width: "50%" }}>Jumlah</div>
                                    <div className="detail-value" style={{ width: "50%", textAlign: "end" }}> Rp. {isWithdraw ? form?.["tt-amount"] : form?.["st-amount"]}  </div>
                                </div>
                            </div>
                            <div onClick={handleScreenshot} style={{ cursor: "pointer" }} className="btn btn-qr">Simpan</div>
                            <div onClick={backtoHome} style={{ cursor: "pointer" }} className="btn btn-outline">Selanjutnya</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
