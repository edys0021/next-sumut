import "./index.css"
import "../e-form/index.css"
import Navbar from "../../commons/navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import d from "@/lib/decryptor";
import e from "@/lib/encryptor"
import moment from "moment";
import Cookies from "js-cookie";
import sensorNama from "@/lib/censor";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { useConfig } from "@/providers/config-provider";
import { useRouter } from "next/navigation";

export default function ValidationComp() {
    const config = useConfig();
    const router = useRouter();

    const [title, setTitle] = useState<string>("");
    const [form, setForm] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);
    const [aggre, setAggre] = useState(false);
    const [modal, setmodal] = useState(false);

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

    useEffect(() => {
        const withdrawCookie = Cookies.get("withdraw");
        const depositCookie = Cookies.get("deposit");

        if (localStorage?.category === "1" && withdrawCookie) {
            setTitle('Tarikan Tunai');
            setForm(JSON.parse(d(withdrawCookie)));
        } else if (depositCookie) {
            setTitle('Setoran Tunai');
            setForm(JSON.parse(d(depositCookie)));
        }
    }, [])

    const back = () => {
        router.push("/e-form")
    }

    const submitForm = () => {
        // setLoading(true);
        let formObj: Record<string, any> = {};
        const withdrawCookie = Cookies.get("withdraw");
        const depositCookie = Cookies.get("deposit");

        if (title === 'Tarikan Tunai' && withdrawCookie) {
            formObj = JSON.parse(d(withdrawCookie));
            if (formObj["tt-amount"]) formObj["tt-amount"] = formObj["tt-amount"].replaceAll(".", "");
        } else if (depositCookie) {
            formObj = JSON.parse(d(depositCookie));
            if (formObj["st-amount"]) formObj["st-amount"] = formObj["st-amount"].replaceAll(".", "");
        }

        formObj.category = localStorage?.category;
        formObj.branchId = Cookies.get("branchId");

        const cleaned = Object.fromEntries(
            Object.entries(formObj).map(([key, value]) => [
                key.replace(/^(tt-|st-)/, ""),
                value
            ])
        );

        const timestamp = `${moment().format().replace('T', ' ').split('+')[0]}`;

        const payload = {
            timestamp,
            content: e(JSON.stringify(cleaned))
        }

        axios({
            method: "POST",
            url: `${config.serverIp}/transactions/form-submission`,
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
                // setLoading(false)
                const { reffid } = JSON.parse(d(data.content));
                Cookies.set("reffid", reffid, { expires: 1 });
                router.push("/generate-voucher");
            })
            .catch((err) => {
                console.log(err);
                // setLoading(false);
                showWarning();
            })
    }

    const handleChange = (e: any) => {
        setAggre(e.target.checked);
        setLoading(true)
        setTimeout(() => {
            setmodal(false);
            setLoading(false)
        }, 300);
    };

    const onOpenModals = () => {
        setTimeout(() => {
            setmodal(true);
        }, 100);
    }

    const onCloseModals = () => {
        setTimeout(() => {
            setmodal(false);
        }, 100);
    }

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
            {loading &&
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', width: '100vw', position: 'fixed', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }} >
                    <img src={"./images/loading.gif"} alt='loading' style={{ width: '50px' }} />
                </div>
            }
            {modal &&
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', width: '100vw', position: 'fixed', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <div className="modalss" >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <h2>Pernyataan Nasabah</h2>
                            <h2 style={{ cursor: 'pointer', color: 'red' }} onClick={() => onCloseModals()}>X</h2>
                        </div>
                        <hr />
                        <h4>Sehubungan dengan data / informasi yang saya berikan, dengan ini Saya selaku pemohon menyatakan sebagai berikut : </h4>
                        <div className="content-text">
                            <div className="pernyataan ps-2">1. Bahwa semua informasi dalam formulir aplikasi melalui website /online ini telah Saya isi dengan lengkap dan benar - benarnya dan bilamana dikemudian hari terdapat tuntutan dari pihak ketiga baik yang bersifat perdata maupun pidana, maka Saya akan bertanggungjawab penuh atas segala tuntutan dimaksud serta membebaskan Bank Sumut dari segala tuntutan, gugatan, dan atau tindakan hukum lainnya dalam bentuk apapun dari pihak manapun.</div>
                            <div className="pernyataan ps-2">2. Dengan ini Saya memberikan persetujuan dan kuasa kepada Bank Sumut untuk melakukan pemeriksaan dan / atau melakukan verifikasi atas kebenaran, kelengkapan, dan keabsahan dari setiap informasi transaksi yang dilakukan.</div>
                            <div className="pernyataan ps-2">3. Bank Sumut berhak untuk menolak / menunda permohonan yang Saya ajukan dengan memberikan alasan / penjelasan.</div>
                        </div>
                        <div style={{ marginTop: 24 }} >
                            <input type="checkbox" name="agreement" checked={aggre} onChange={handleChange} />
                            <label className="textindent"> Saya menyetujui ketentuan penggunaan aplikasi eBranch ini</label>
                        </div>
                    </div>

                </div>
            }

            <Navbar />
            <div className="card-confirmation-main invisible-scrollbar">
                <div style={{ marginTop: '42px' }} className="progress-bar">
                    <div style={{ backgroundColor: 'white' }} className="progress-start">
                        <div className="progress-title" style={{ color: 'white' }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: 'white' }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: 'white' }} >Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: '#bebbbbff' }} className="progress-done">
                        <div className="progress-title" style={{ color: '#bebbbbff' }} >Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form">{title}</div>
                </div>
                <div className="card-form-section" style={{ height: '50vh' }}>
                    <div className="confirm-text-t">
                        <div className="confirm-text-field-t">
                            Pastikan semua data yang dimasukkan sudah benar.
                        </div>
                    </div>
                    <div className="document-confirmation-t">
                        <div className="card-confirmation">
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="label-section-c">Data Transaksi</label>
                                {/* <img src="images/up021.png" alt="up-logo" style={{ width: 'auto', height: 36, marginBottom : '-24px', cursor:'pointer' }} /> */}
                            </div>
                            <div className="comp-confirmation">
                                {title === "Tarikan Tunai" ? (
                                    <>
                                        <div className="value-label">
                                            <label className="label-section-t">Nomor Rekening</label>
                                            <div className="value-data">{form?.["tt-rek"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Nama Pemilik Rekening</label>
                                            <div className="value-data">{(form?.["tt-name"]) && sensorNama(form?.["tt-name"])}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Jumlah</label>
                                            <div className="value-data">IDR {form?.["tt-amount"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Terbilang</label>
                                            <div className="value-data">{form?.["tt-amounttext"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Nomor Handphone</label>
                                            <div className="value-data">{form?.["tt-phone"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Keterangan Transaksi</label>
                                            <div className="value-data">{form?.["tt-ket"]}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="value-label">
                                            <label className="label-section-t">Nomor Rekening</label>
                                            <div className="value-data">{form?.["st-rek"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Nama Pemilik Rekening</label>
                                            <div className="value-data">{(form?.["st-rekname"]) && sensorNama(form?.["st-rekname"])}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Jumlah</label>
                                            <div className="value-data">IDR {form?.["st-amount"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Terbilang</label>
                                            <div className="value-data">{form?.["st-amounttext"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Terbilang</label>
                                            <div className="value-data">{form?.["st-namecus"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Terbilang</label>
                                            <div className="value-data">{form?.["st-source"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Nomor Handphone</label>
                                            <div className="value-data">{form?.["st-phone"]}</div>
                                        </div>
                                        <div className="value-label">
                                            <label className="label-section-t">Keterangan Transaksi</label>
                                            <div className="value-data">{form?.["st-ket"]}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ marginTop: 24 }} >
                                <input type="checkbox" name="agreement" checked={aggre} onChange={handleChange} />
                                <label> Saya menyetujui <u onClick={() => onOpenModals()} style={{ color: '#2845D6', cursor: 'pointer' }}>ketentuan</u> penggunaan aplikasi eBranch ini</label>
                            </div>
                        </div>

                        <div className="button-comp">
                            <div onClick={() => back()} style={{ cursor: 'pointer' }} className="button-cancel">Batal</div>
                            {/* {aggre ? ( */}
                                <div onClick={() => submitForm()} style={{ marginLeft: '16px', cursor: 'pointer' }} className="button-next">Selanjutnya</div>
                            {/* ) : (
                                <div style={{ marginLeft: '16px', cursor: 'pointer', backgroundColor: '#bebebe', color: 'white' }} className="button-next">Selanjutnya</div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
