"use-client";

import "./index.css"
import { useEffect, useState } from "react";
import Navbar from "../../commons/navbar";
import convertString from "@/lib/converter";
import formatCurrency from "@/lib/formatter";
import isValidNominal from "@/lib/validator";


import axios from "axios";
import moment from "moment";
import d from "@/lib/decryptor";
import e from "@/lib/encryptor";
import sensorNama from "@/lib/censor";

import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

import { useConfig } from "@/providers/config-provider";
import { useRouter } from "next/navigation";

export default function EformComp() {
    const config = useConfig();
    const router = useRouter();

    const [title, setTitle] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [validNomTt, setValidNomTt] = useState(true);
    const [validNomSt, setValidNomSt] = useState(true);

    const showWarning = () => {
        toast.error("Harap lengkapi data di bawah", {
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

    const [valTt, setValtt] = useState({
        rek: false,
        name: false,
        amount: false,
        hp: false,
        ket: false
    })

    const [valSt, setValSt] = useState({
        rek: false,
        name: false,
        amount: false,
        namecus: false,
        source: false,
        hp: false,
        ket: false
    })

    const [tt, setTt] = useState({
        "tt-rek": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-rek"] : "",
        "tt-name": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-name"] : "",
        "tt-amount": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-amount"] : "",
        "tt-amounttext": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-amounttext"] : "",
        "tt-phone": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-phone"] : "",
        "tt-ket": Cookies.get("deposit") ? JSON.parse(d(Cookies.get("deposit")!))["tt-ket"] : ""
    });
    const [st, setSt] = useState({
        "st-rek": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-rek"] : "",
        "st-rekname": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-rekname"] : "",
        "st-amount": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-amount"] : "",
        "st-amounttext": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-amounttext"] : "",
        "st-namecus": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-namecus"] : "",
        "st-source": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-source"] : "",
        "st-phone": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-phone"] : "",
        "st-ket": Cookies.get("withdraw") ? JSON.parse(d(Cookies.get("withdraw")!))["st-ket"] : ""
    });

    useEffect(() => {
        if (localStorage?.category === "1") setTitle('Tarikan Tunai');
        if (localStorage?.category === "2") setTitle('Setoran Tunai');
        if (Cookies.get("deposit")) Cookies.remove("deposit");
        if (Cookies.get("withdraw")) Cookies.remove("withdraw");
    }, [])


    const getName = async (payload: { timestamp: string; content: string }) => {
        try {
            console.log(payload, "REC2");
            setLoading(true)
            const setup = {
                method: "POST",
                url: `${config?.serverIp}/account-number/get-validation`,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                data: JSON.stringify(payload),
            };
            const response = await axios(setup);
            console.log(response);

            if (response) {
                const { data } = await axios(setup);
                const { content } = data
                const { accountName, branchId } = JSON.parse(d(content))
                Cookies.set("branchId", branchId, { expires: 1 });
                setLoading(false)
                return accountName;
            } else {
                if (localStorage.category === "1") {
                    setValtt({
                        ...valTt,
                        name: true
                    })
                } else {
                    setValSt({
                        ...valSt,
                        name: true
                    })
                }
                setLoading(false)
                return ""

            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error("❌ Server error:", {
                        status: error.response.status,
                        data: error.response.data,
                    });
                    if (localStorage.category === "1") {
                        setValtt({
                            ...valTt,
                            name: true
                        })
                    } else {
                        setValSt({
                            ...valSt,
                            name: true
                        })
                    }
                    setLoading(false)
                    return ""
                } else if (error.request) {
                    console.error("❌ No response from server:", error.request);
                    if (localStorage.category === "1") {
                        setValtt({
                            ...valTt,
                            name: true
                        })
                    } else {
                        setValSt({
                            ...valSt,
                            name: true
                        })
                    }
                    setLoading(false)
                    return ""
                } else {
                    console.error("❌ Request setup error:", error.message);
                    if (localStorage.category === "1") {
                        setValtt({
                            ...valTt,
                            name: true
                        })
                    } else {
                        setValSt({
                            ...valSt,
                            name: true
                        })
                    }
                    setLoading(false)
                    return ""
                }
            }

            console.error("❌ Unexpected error:", error);
            if (localStorage.category === "1") {
                setValtt({
                    ...valTt,
                    name: true
                })
            } else {
                setValSt({
                    ...valSt,
                    name: true
                })
            }
            setLoading(false)
            return ""
        }
    }

    const changeTt = async (el: any) => {
        let name = el.target.name;
        let value = el.target.value;

        if (name === "tt-phone") {
            if (value.length === 0) {
                value = ""
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[0-9]*$/.test(value[i])) {
                        if (value[i]) {
                            value = value.replace(/[^0-9]/g, "")
                            setValtt({
                                ...valTt,
                                hp: true
                            })

                            setTimeout(() => {
                                setValtt({
                                    ...valTt,
                                    hp: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 15) {
                    value = value.slice(0, 15)
                    setValtt({
                        ...valTt,
                        hp: true
                    })

                    setTimeout(() => {
                        setValtt({
                            ...valTt,
                            hp: false
                        })
                    }, 2000);
                }
            }
        }

        if (name === "tt-amount") {
            if (value.length === 0) {
                value = ""
                tt["tt-amounttext"] = ""
                setValidNomTt(true)
            } else {
                for (let i = 0; i < value.length; i++) {
                    value = value.replaceAll(".", "");
                    if (!/^[0-9]*$/.test(value[i])) {
                        if (value[i]) {
                            value = value.replace(/[^0-9]/g, "")
                            setValtt({
                                ...valTt,
                                amount: true
                            })

                            setTimeout(() => {
                                setValtt({
                                    ...valTt,
                                    amount: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 15) {
                    value = value.slice(0, 15)
                    setValtt({
                        ...valTt,
                        amount: true
                    })

                    setTimeout(() => {
                        setValtt({
                            ...valTt,
                            amount: false
                        })
                    }, 2000);
                }

                setValidNomTt(isValidNominal(value, 10000));

                tt["tt-amounttext"] = Number(value.replaceAll(".", "")) > 0 ? convertString(value.replaceAll(".", "")) + "Rupiah" : "";
                value = formatCurrency(value.replaceAll(".", ""));
            }
        }

        const timestamp = `${moment().format().replace('T', ' ').split('+')[0]}`;
        if (name === "tt-rek") {
            for (let i = 0; i < value.length; i++) {
                value = value.replaceAll(".", "");
                if (!/^[0-9]*$/.test(value[i])) {
                    if (value[i]) {
                        value = value.replace(/[^0-9]/g, "")
                        setValtt({
                            ...valTt,
                            rek: true
                        })

                        setTimeout(() => {
                            setValtt({
                                ...valTt,
                                rek: false
                            })
                        }, 2000);
                    }
                }
            }
            if (value.length === 14) {
                el.target.blur();
                const payload = {
                    timestamp,
                    content: e(JSON.stringify({ accountNumber: value }))
                }
                const name = await getName(payload)
                tt["tt-name"] = name
            } else if (value.length < 14) {
                tt["tt-name"] = ""
                setValtt({
                    ...valTt,
                    name: false
                })
            } else {
                value = value.slice(0, 14)
                setValtt({
                    ...valTt,
                    rek: true
                })
                setTimeout(() => {
                    setValtt({
                        ...valTt,
                        rek: false
                    })
                }, 2000);
            }
        }

        if (name === "tt-ket") {
            if (value.length === 0) {
                value = ""
                setValtt({
                    ...valTt,
                    ket: true
                })
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[a-zA-Z ]*$/.test(value[i]) || value[0] === " " || (value[i] === " " && value[i - 1] === " ")) {
                        if (value[0] === " ") {
                            value = value.replace(value[i], "");
                        } else if (value[i] === " " && value[i - 1] === " ") {
                            value[i] = ""
                        } else {
                            value = value.replace(/[^a-zA-Z ]/g, "");
                            setValtt({
                                ...valTt,
                                ket: true
                            })

                            setTimeout(() => {
                                setValtt({
                                    ...valTt,
                                    ket: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 36) {
                    setValtt({
                        ...valTt,
                        ket: true
                    })

                    setTimeout(() => {
                        setValtt({
                            ...valTt,
                            ket: false
                        })
                    }, 2000);
                    value = value.slice(0, 36);
                }
            }
        }

        setTt({
            ...tt,
            [name]: value
        })
    }

    const changeSt = async (el: any) => {
        let name = el.target.name;
        let value = el.target.value;


        if (name === "st-namecus") {
            if (value.length === 0) {
                value = ""
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[a-zA-Z ]*$/.test(value[i]) || value[0] === " " || (value[i] === " " && value[i - 1] === " ")) {
                        if (value[0] === " ") {
                            value = value.replace(value[i], "");
                        } else if (value[i] === " " && value[i - 1] === " ") {
                            value[i] = ""
                        } else {
                            value = value.replace(/[^a-zA-Z ]/g, "");
                            setValSt({
                                ...valSt,
                                namecus: true
                            })

                            setTimeout(() => {
                                setValSt({
                                    ...valSt,
                                    namecus: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 36) {
                    setValSt({
                        ...valSt,
                        namecus: true
                    })

                    setTimeout(() => {
                        setValSt({
                            ...valSt,
                            namecus: false
                        })
                    }, 2000);
                    value = value.slice(0, 36)
                }

            }
        }

        if (name === "st-source") {
            if (value.length === 0) {
                value = ""
                setValSt({
                    ...valSt,
                    name: true
                })
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[a-zA-Z ]*$/.test(value[i]) || value[0] === " " || (value[i] === " " && value[i - 1] === " ")) {
                        if (value[0] === " ") {
                            value = value.replace(value[i], "");
                        } else if (value[i] === " " && value[i - 1] === " ") {
                            value[i] = ""
                        } else {
                            value = value.replace(/[^a-zA-Z ]/g, "");
                            setValSt({
                                ...valSt,
                                source: true
                            })

                            setTimeout(() => {
                                setValSt({
                                    ...valSt,
                                    source: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 36) {
                    setValSt({
                        ...valSt,
                        source: true
                    })

                    setTimeout(() => {
                        setValSt({
                            ...valSt,
                            source: false
                        })
                    }, 2000);
                    value = value.slice(0, 36);
                }
            }
        }

        if (name === "st-phone") {
            if (value.length === 0) {
                value = ""
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[0-9]*$/.test(value[i])) {
                        if (value[i]) {
                            value = value.replace(/[^0-9]/g, "")
                            setValSt({
                                ...valSt,
                                hp: true
                            })

                            setTimeout(() => {
                                setValSt({
                                    ...valSt,
                                    hp: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 15) {
                    setValSt({
                        ...valSt,
                        hp: true
                    })

                    setTimeout(() => {
                        setValSt({
                            ...valSt,
                            hp: false
                        })
                    }, 2000);
                    value = value.slice(0, 15)
                }
            }
        }

        if (name === "st-amount") {
            if (value.length === 0) {
                value = ""
                st["st-amounttext"] = ""
                setValidNomSt(true);
            } else {
                for (let i = 0; i < value.length; i++) {
                    value = value.replaceAll(".", "");
                    if (!/^[0-9]*$/.test(value[i])) {
                        if (value[i]) {
                            value = value.replace(/[^0-9]/g, "")
                            setValSt({
                                ...valSt,
                                amount: true
                            })

                            setTimeout(() => {
                                setValSt({
                                    ...valSt,
                                    amount: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 15) {
                    setValSt({
                        ...valSt,
                        amount: true
                    })

                    setTimeout(() => {
                        setValSt({
                            ...valSt,
                            amount: false
                        })
                    }, 2000);
                    value = value.slice(0, 15)
                }

                setValidNomSt(isValidNominal(value, 1000));

                st["st-amounttext"] = Number(value.replaceAll(".", "")) > 0 ? convertString(value.replaceAll(".", "")) + "Rupiah" : "";
                value = formatCurrency(value.replaceAll(".", ""));
            }
        }

        const timestamp = `${moment().format().replace('T', ' ').split('+')[0]}`;

        if (name === "st-rek") {
            for (let i = 0; i < value.length; i++) {
                value = value.replaceAll(".", "");
                if (!/^[0-9]*$/.test(value[i])) {
                    if (value[i]) {
                        value = value.replace(/[^0-9]/g, "")
                        setValSt({
                            ...valSt,
                            rek: true
                        })

                        setTimeout(() => {
                            setValSt({
                                ...valSt,
                                rek: false
                            })
                        }, 2000);
                    }
                }
            }
            if (value.length === 14) {
                el.target.blur();

                const payload = {
                    timestamp,
                    content: e(JSON.stringify({ accountNumber: value }))
                }
                const name = await getName(payload)
                st["st-rekname"] = name
            } else if (value.length < 14) {
                st["st-rekname"] = ""
            } else {
                setValSt({
                    ...valSt,
                    rek: true
                })

                setTimeout(() => {
                    setValSt({
                        ...valSt,
                        rek: false
                    })
                }, 2000);
                value = value.slice(0, 14)
            }
        }

        if (name === "st-ket") {
            if (value.length === 0) {
                value = ""
                setValSt({
                    ...valSt,
                    ket: true
                })
            } else {
                for (let i = 0; i < value.length; i++) {
                    if (!/^[a-zA-Z ]*$/.test(value[i]) || value[0] === " " || (value[i] === " " && value[i - 1] === " ")) {
                        if (value[0] === " ") {
                            value = value.replace(value[i], "");
                        } else if (value[i] === " " && value[i - 1] === " ") {
                            value[i] = ""
                        } else {
                            value = value.replace(/[^a-zA-Z ]/g, "");
                            setValSt({
                                ...valSt,
                                ket: true
                            })

                            setTimeout(() => {
                                setValSt({
                                    ...valSt,
                                    ket: false
                                })
                            }, 2000);
                        }
                    }
                }

                if (value.length > 36) {
                    setValSt({
                        ...valSt,
                        ket: true
                    })

                    setTimeout(() => {
                        setValSt({
                            ...valSt,
                            ket: false
                        })
                    }, 2000);
                    value = value.slice(0, 36);
                }
            }
        }

        setSt({
            ...st,
            [name]: value
        })
    }

    const submitForm = () => {
        if (localStorage?.category === "1") {
            const hasEmpty = Object.values(tt).some(e => e === "");
            if (hasEmpty || !validNomTt) {
                showWarning();
            } else {
                Cookies.set("withdraw", e(JSON.stringify(tt)), { expires: 1 })
                router.push("/validation");
            }
        } else {
            const hasEmpty = Object.values(st).some(e => e === "");
            if (hasEmpty || !validNomSt) {
                showWarning();
            } else {
                Cookies.set("deposit", e(JSON.stringify(st)), { expires: 1 })
                router.push("/validation")
            }
        }
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
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', width: '100vw', position: 'fixed', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <img src={"assets/images/loading.gif"} alt='loading' style={{ width: '50px' }} />
                </div>
            }
            <Navbar />
            <div className="card-form invisible-scrollbar">
                <div className="progress-bar">
                    <div style={{ backgroundColor: 'white' }} className="progress-start">
                        <div className="progress-title" style={{ color: 'white' }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: '#bebbbbff' }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: '#bebbbbff' }} >Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: '#bebbbbff' }} className="progress-done">
                        <div className="progress-title" style={{ color: '#bebbbbff' }} >Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form">{title}</div>
                </div>
                <div className="card-form-section">
                    {title === 'Tarikan Tunai' &&
                        <>
                            <div className="section-form">Lengkapi <b>data transaksi</b> di bawah ini.</div>
                            <div className="document-form">
                                <div className="input-form">
                                    <label className="label-section">Nomor Rekening</label>
                                    <input type="text" inputMode="numeric" autoComplete="off" className="input-field" name="tt-rek" onChange={changeTt} value={tt["tt-rek"]} />
                                </div>
                                {valTt?.rek && <div className="war-alert" >* Input berupa angka dan panjang 14 digit</div>}
                                <div className="input-form">
                                    <label className="label-section">Nama Pemilik Rekening</label>
                                    <input autoComplete="off" className="input-field" style={{ backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} name="tt-name" onChange={changeTt} value={sensorNama(tt["tt-name"])} disabled />
                                </div>
                                {valTt?.name && <div className="war-alert" >* Nama Pemilik Rekening Tidak Ditemukan</div>}
                                <div className="input-form">
                                    <label className="label-section">Jumlah</label>
                                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <input autoComplete="off" style={{ width: '36px', backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} className="input-field" value={"IDR"} disabled />
                                        <input type="text" inputMode="numeric" autoComplete="off" style={{ width: 'calc(100% - 96px)' }} className="input-field" name="tt-amount" onChange={changeTt} value={tt["tt-amount"]} />
                                    </div>
                                </div>
                                {valTt?.amount && <div className="war-alert" >* Input berupa angka dan maksimal 15 digit</div>}
                                {!validNomTt && <div className="war-alert" >* Input minimal dan kelipatan dari 10.000</div>}
                                <div className="input-form">
                                    <label className="label-section">Terbilang</label>
                                    <input autoComplete="off" className="input-field" style={{ backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} name="tt-amounttext" onChange={changeTt} value={tt["tt-amounttext"]} disabled />
                                </div>
                                <div className="input-form">
                                    <label className="label-section">Nomor Handphone</label>
                                    <input type="text" inputMode="numeric" autoComplete="off" className="input-field" name="tt-phone" onChange={changeTt} value={tt["tt-phone"]} />
                                </div>
                                {valTt?.hp && <div className="war-alert" >* Input berupa angka dan maksimal 15 digit</div>}
                                <div className="input-form">
                                    <label className="label-section">Keterangan Transaksi</label>
                                    <input autoComplete="off" className="input-field" name="tt-ket" onChange={changeTt} value={tt["tt-ket"]} />
                                </div>
                                {valTt?.ket && <div className="war-alert" >* Input berupa huruf dan maksimal 36 karakter</div>}
                                <div className="button-form">
                                    <div onClick={() => router.push("/")} style={{ cursor: 'pointer' }} className="button-cancel">Batal</div>
                                    <div onClick={() => submitForm()} style={{ marginLeft: '16px', cursor: 'pointer' }} className="button-next">Selanjutnya</div>
                                </div>
                            </div>
                        </>
                    }
                    {title === 'Setoran Tunai' &&
                        <>
                            <div className="section-form">Lengkapi <b>data transaksi</b> di bawah ini.</div>
                            <div className="document-form">
                                <div className="input-form">
                                    <label className="label-section">Nomor Rekening</label>
                                    <input type="text" inputMode="numeric" autoComplete="off" className="input-field" name="st-rek" onChange={changeSt} value={st["st-rek"]} />
                                </div>
                                {valSt?.rek && <div className="war-alert" >* Input berupa angka dan panjang 14 digit</div>}
                                <div className="input-form">
                                    <label className="label-section">Nama Pemilik Rekening</label>
                                    <input autoComplete="off" className="input-field" style={{ backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} disabled name="st-rekname" onChange={changeSt} value={sensorNama(st["st-rekname"])} />
                                </div>
                                {valSt?.name && <div className="war-alert" >* Nama Pemilik Rekening Tidak Ditemukan</div>}
                                <div className="input-form">
                                    <label className="label-section">Jumlah</label>
                                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <input autoComplete="off" style={{ width: '36px', backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} className="input-field" value={"IDR"} disabled />
                                        <input type="text" inputMode="numeric" autoComplete="off" style={{ width: 'calc(100% - 96px)' }} className="input-field" name="st-amount" onChange={changeSt} value={st["st-amount"]} />
                                    </div>
                                </div>
                                {valSt?.amount && <div className="war-alert" >* Input berupa angka dan maksimal 15 digit</div>}
                                {!validNomSt && <div className="war-alert" >* Input minimal dan kelipatan dari 1.000</div>}
                                <div className="input-form">
                                    <label className="label-section">Terbilang</label>
                                    <input autoComplete="off" className="input-field" style={{ backgroundColor: "#EEEEEE", borderBlockColor: '#C9CDCF' }} name="st-amounttext" onChange={changeSt} value={st["st-amounttext"]} />
                                </div>
                                <div className="input-form">
                                    <label className="label-section">Nama Penyetor Sesuai KTP</label>
                                    <input autoComplete="off" className="input-field" name="st-namecus" onChange={changeSt} value={st["st-namecus"]} />
                                </div>
                                {valSt?.namecus && <div className="war-alert" >* Input berupa huruf dan maksimal 36 karakter</div>}
                                <div className="input-form">
                                    <label className="label-section">Sumber Dana</label>
                                    <input autoComplete="off" className="input-field" name="st-source" onChange={changeSt} value={st["st-source"]} />
                                </div>
                                {valSt?.source && <div className="war-alert" >* Input berupa huruf dan maksimal 36 karakter</div>}
                                <div className="input-form">
                                    <label className="label-section">Nomor Handphone</label>
                                    <input type="text" inputMode="numeric" autoComplete="off" className="input-field" name="st-phone" onChange={changeSt} value={st["st-phone"]} />
                                </div>
                                {valSt?.hp && <div className="war-alert" >* Input berupa angka dan panjang maksimal 15 digit</div>}
                                <div className="input-form">
                                    <label className="label-section">Keterangan Transaksi</label>
                                    <input autoComplete="off" className="input-field" name="st-ket" onChange={changeSt} value={st["st-ket"]} />
                                </div>
                                {valSt?.ket && <div className="war-alert" >* Input berupa huruf dan maksimal 36 karakter</div>}
                                <div className="button-form">
                                    <div onClick={() => router.push("/")} style={{ cursor: 'pointer' }} className="button-cancel">Batal</div>
                                    <div onClick={() => submitForm()} style={{ marginLeft: '16px', cursor: 'pointer' }} className="button-next">Selanjutnya</div>
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>

    )
}