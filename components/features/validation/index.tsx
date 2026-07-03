"use client";

import "./index.css";
import "../e-form/index.css";
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import { useRouter } from "next/navigation";
import { ToastContainer, toast, Zoom } from "react-toastify";
import LoadingOverlay from "@/components/commons/loading-overlay";
import Navbar from "@/components/commons/navbar";
import sensorNama from "@/lib/censor";
import d from "@/lib/decryptor";
import e from "@/lib/encryptor";
import {
    getTransactionFormByCategory,
    TRANSACTION_CATEGORY,
    TRANSACTION_TITLE,
    useStoredTransactionCategory,
} from "@/lib/transaction-storage";
import { env } from "@/config/env";
type SubmissionForm = Record<string, string | undefined>;

const timestampNow = () => moment().format().replace("T", " ").split("+")[0];

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="value-label">
            <label className="label-section-t">{label}</label>
            <div className="value-data">{value}</div>
        </div>
    );
}

export default function ValidationComp() {
    const router = useRouter();
    const category = useStoredTransactionCategory();
    const title = category ? TRANSACTION_TITLE[category] : "";
    const form = useMemo(() => getTransactionFormByCategory(category), [category]);

    const [loading, setLoading] = useState(false);
    const [aggre, setAggre] = useState(false);
    const [modal, setModal] = useState(true);

    const showWarning = () => {
        toast.error("Terjadi kesalahan server, mohon ulangi beberapa saat lagi", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "colored",
            transition: Zoom,
            className: "custom-toast",
        });
    };

    const back = () => {
        router.push("/e-form");
    };

    const submitForm = () => {
        const formObj: SubmissionForm = { ...(getTransactionFormByCategory(category) ?? {}) };

        if (category === TRANSACTION_CATEGORY.WITHDRAW && formObj["tt-amount"]) {
            formObj["tt-amount"] = formObj["tt-amount"].replaceAll(".", "");
        }

        if (category === TRANSACTION_CATEGORY.DEPOSIT && formObj["st-amount"]) {
            formObj["st-amount"] = formObj["st-amount"].replaceAll(".", "");
        }

        formObj.category = category ?? undefined;
        formObj.branchId = Cookies.get("branchId");

        const cleaned = Object.fromEntries(
            Object.entries(formObj).map(([key, value]) => [
                key.replace(/^(tt-|st-)/, ""),
                value,
            ])
        );

        const payload = {
            timestamp: timestampNow(),
            content: e(JSON.stringify(cleaned)),
        };

        axios({
            method: "POST",
            url: `${env.serverIp}/formSubmission`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET",
                "Access-Control-Max-Age": "3600",
            },
            data: JSON.stringify(payload),
        })
            .then(({ data }) => {
                const { reffid } = JSON.parse(d(data.content));
                Cookies.set("reffid", reffid, { expires: 1 });
                router.push("/generate-voucher");
            })
            .catch((error: unknown) => {
                console.log(error);
                showWarning();
            });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAggre(event.target.checked);
        setLoading(true);
        window.setTimeout(() => {
            setModal(false);
            setLoading(false);
        }, 300);
    };

    const onOpenModals = () => {
        window.setTimeout(() => {
            setModal(true);
        }, 100);
    };

    const onCloseModals = () => {
        window.setTimeout(() => {
            setModal(false);
        }, 100);
    };

    const isWithdraw = title === TRANSACTION_TITLE[TRANSACTION_CATEGORY.WITHDRAW];

    return (
        <div className="form-page">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                theme="colored"
                transition={Zoom}
            />
            {loading && <LoadingOverlay />}
            {modal && (
                <div className="modal-overlay">
                    <div className="modalss" role="dialog" aria-modal="true" aria-labelledby="agreement-title">
                        <div className="modal-header">
                            <h2 id="agreement-title" className="modal-title">Pernyataan Nasabah</h2>
                            <button type="button" className="modal-close" onClick={onCloseModals} aria-label="Tutup">
                                ×
                            </button>
                        </div>
                        <div className="modal-divider" />
                        <h4 className="modal-subtitle">Sehubungan dengan data / informasi yang saya berikan, dengan ini Saya selaku pemohon menyatakan sebagai berikut:</h4>
                        <div className="content-text">
                            <div className="pernyataan ps-2">1. Saya menyatakan bahwa seluruh data dan/atau informasi yang saya sampaikan melalui formulir aplikasi ini telah saya isi secara lengkap dan benar serta dapat dipertanggungjawabkan. Apabila di kemudian hari diketahui bahwa data dan/atau informasi tersebut tidak benar atau tidak sesuai dengan kondisi yang sebenarnya, saya bersedia bertanggung jawab atas segala akibat yang timbul sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.</div>
                            <div className="pernyataan ps-2">2. Saya memberikan persetujuan kepada Bank Sumut untuk melakukan pemeriksaan dan/atau verifikasi atas kebenaran, kelengkapan, dan keabsahan data serta informasi yang saya sampaikan, termasuk melakukan konfirmasi kepada pihak terkait sepanjang diperlukan sesuai dengan ketentuan yang berlaku.</div>
                            <div className="pernyataan ps-2">3. Dengan memberikan penjelasan kepada saya, Bank Sumut dapat menolak atau menunda permohonan transaksi saya apabila berdasarkan hasil pemeriksaan atau verifikasi ditemukan ketidaksesuaian data atau informasi berdasarkan hasil pemeriksaan sesuai dengan ketentuan yang berlaku.</div>
                            <div className="pernyataan ps-2">4. Dengan ini saya menyatakan telah membaca, memahami, dan menyetujui ketentuan penggunaan layanan eBranch Bank Sumut.</div>
                        </div>
                        <div className="modal-agreement">
                            <input type="checkbox" name="agreement" checked={aggre} onChange={handleChange} />
                            <label className="textindent">Saya menyetujui ketentuan penggunaan aplikasi eBranch ini</label>
                        </div>
                    </div>
                </div>
            )}

            <Navbar />
            <div className="card-confirmation-main invisible-scrollbar">
                <div style={{ marginTop: "42px" }} className="progress-bar">
                    <div style={{ backgroundColor: "white" }} className="progress-start">
                        <div className="progress-title" style={{ color: "white" }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: "white" }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: "white" }} >Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: "#bebbbbff" }} className="progress-done">
                        <div className="progress-title" style={{ color: "#bebbbbff" }} >Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form">{title}</div>
                </div>
                <div className="card-form-section" style={{ height: "50vh" }}>
                    <div className="confirm-text-t">
                        <div className="confirm-text-field-t">
                            Pastikan semua data yang dimasukkan sudah benar.
                        </div>
                    </div>
                    <div className="document-confirmation-t">
                        <div className="card-confirmation">
                            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label className="label-section-c">Data Transaksi</label>
                            </div>
                            <div className="comp-confirmation">
                                {isWithdraw ? (
                                    <>
                                        <DetailRow label="Nomor Rekening" value={form?.["tt-rek"]} />
                                        <DetailRow label="Nama Pemilik Rekening" value={form?.["tt-name"] ? sensorNama(form["tt-name"]) : ""} />
                                        <DetailRow label="Jumlah" value={`IDR ${form?.["tt-amount"] ?? ""}`} />
                                        <DetailRow label="Terbilang" value={form?.["tt-amounttext"]} />
                                        <DetailRow label="Nomor Handphone" value={form?.["tt-phone"]} />
                                        <DetailRow label="Keterangan Transaksi" value={form?.["tt-ket"]} />
                                    </>
                                ) : (
                                    <>
                                        <DetailRow label="Nomor Rekening" value={form?.["st-rek"]} />
                                        <DetailRow label="Nama Pemilik Rekening" value={form?.["st-rekname"] ? sensorNama(form["st-rekname"]) : ""} />
                                        <DetailRow label="Jumlah" value={`IDR ${form?.["st-amount"] ?? ""}`} />
                                        <DetailRow label="Terbilang" value={form?.["st-amounttext"]} />
                                        <DetailRow label="Nama Penyetor" value={form?.["st-namecus"]} />
                                        <DetailRow label="Sumber Dana" value={form?.["st-source"]} />
                                        <DetailRow label="Nomor Handphone" value={form?.["st-phone"]} />
                                        <DetailRow label="Keterangan Transaksi" value={form?.["st-ket"]} />
                                    </>
                                )}
                            </div>
                            <div style={{ marginTop: 24 }} >
                                <input type="checkbox" name="agreement" checked={aggre} onChange={handleChange} />
                                <label> Saya menyetujui <u onClick={onOpenModals} style={{ color: "#2845D6", cursor: "pointer" }}>ketentuan</u> penggunaan aplikasi eBranch ini</label>
                            </div>
                        </div>

                        <div className="button-comp">
                            <div onClick={back} style={{ cursor: "pointer" }} className="button-cancel">Batal</div>
                            <div onClick={submitForm} style={{ marginLeft: "16px", cursor: "pointer" }} className="button-next">Selanjutnya</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
