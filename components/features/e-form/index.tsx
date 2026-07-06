"use client";

import "./index.css";
import {
    type ChangeEvent,
    type CSSProperties,
    type ReactNode,
    useEffect,
    useState,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import { useRouter } from "next/navigation";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "@/components/commons/loading-overlay";
import Navbar from "@/components/commons/navbar";
import sensorNama from "@/lib/censor";
import convertString from "@/lib/converter";
import d from "@/lib/decryptor";
import e from "@/lib/encryptor";
import formatCurrency from "@/lib/formatter";
import {
    clearTransactionDraftCookies,
    DEPOSIT_COOKIE,
    getStoredTransactionCategory,
    readEncryptedCookie,
    TRANSACTION_CATEGORY,
    TRANSACTION_TITLE,
    useStoredTransactionCategory,
    WITHDRAW_COOKIE,
} from "@/lib/transaction-storage";
import isValidNominal from "@/lib/validator";
import { env } from "@/config/env";

type TarikanTunaiForm = {
    "tt-rek": string;
    "tt-name": string;
    "tt-amount": string;
    "tt-amounttext": string;
    "tt-phone": string;
    "tt-ket": string;
};

type SetoranTunaiForm = {
    "st-rek": string;
    "st-rekname": string;
    "st-amount": string;
    "st-amounttext": string;
    "st-namecus": string;
    "st-source": string;
    "st-phone": string;
    "st-ket": string;
};

type TarikanValidationField = "rek" | "name" | "amount" | "hp" | "ket";
type SetoranValidationField =
    | "rek"
    | "name"
    | "amount"
    | "namecus"
    | "source"
    | "hp"
    | "ket";

const EMPTY_TARIKAN_FORM: TarikanTunaiForm = {
    "tt-rek": "",
    "tt-name": "",
    "tt-amount": "",
    "tt-amounttext": "",
    "tt-phone": "",
    "tt-ket": "",
};

const EMPTY_SETORAN_FORM: SetoranTunaiForm = {
    "st-rek": "",
    "st-rekname": "",
    "st-amount": "",
    "st-amounttext": "",
    "st-namecus": "",
    "st-source": "",
    "st-phone": "",
    "st-ket": "",
};

const DISABLED_INPUT_STYLE: CSSProperties = {
    backgroundColor: "#EEEEEE",
    borderBlockColor: "#C9CDCF",
};

const IDR_INPUT_STYLE: CSSProperties = {
    ...DISABLED_INPUT_STYLE,
    width: "64px",
    minWidth: "64px",
};

const AMOUNT_INPUT_STYLE: CSSProperties = {
    flex: 1,
    minWidth: 0,
    width: "auto",
};

const AMOUNT_ROW_STYLE: CSSProperties = {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
};

const createInitialTarikanForm = (): TarikanTunaiForm => {
    if (getStoredTransactionCategory() !== TRANSACTION_CATEGORY.WITHDRAW) {
        return { ...EMPTY_TARIKAN_FORM };
    }

    return {
        ...EMPTY_TARIKAN_FORM,
        ...readEncryptedCookie<TarikanTunaiForm>(WITHDRAW_COOKIE),
    };
};

const createInitialSetoranForm = (): SetoranTunaiForm => {
    if (getStoredTransactionCategory() !== TRANSACTION_CATEGORY.DEPOSIT) {
        return { ...EMPTY_SETORAN_FORM };
    }

    return {
        ...EMPTY_SETORAN_FORM,
        ...readEncryptedCookie<SetoranTunaiForm>(DEPOSIT_COOKIE),
    };
};

const timestampNow = () => moment().format().replace("T", " ").split("+")[0];

const normalizeNumeric = (
    value: string,
    maxLength: number,
    onInvalid: () => void,
    stripDots = false
) => {
    const normalized = stripDots ? value.replaceAll(".", "") : value;
    const digitsOnly = normalized.replace(/[^0-9]/g, "");

    if (digitsOnly !== normalized || digitsOnly.length > maxLength) {
        onInvalid();
    }

    return digitsOnly.slice(0, maxLength);
};

const normalizeAlphaSpace = (
    value: string,
    maxLength: number,
    onInvalid: () => void
) => {
    const normalized = value
        .replace(/^\s+/, "")
        .replace(/[^a-zA-Z ]/g, "")
        .replace(/\s{2,}/g, " ");
    const limited = normalized.slice(0, maxLength);

    if (limited !== value) {
        onInvalid();
    }

    return limited;
};

const toAmountText = (digits: string) =>
    Number(digits) > 0 ? `${convertString(Number(digits))}Rupiah` : "";

function WarningMessage({ children }: { children: ReactNode }) {
    return <div className="war-alert">{children}</div>;
}

function InputGroup({
    children,
    label,
}: {
    children: ReactNode;
    label: string;
}) {
    return (
        <div className="input-form">
            <label className="label-section">{label}</label>
            {children}
        </div>
    );
}

export default function EformComp() {
    const router = useRouter();
    const category = useStoredTransactionCategory();
    const title = category ? TRANSACTION_TITLE[category] : undefined;

    const [loading, setLoading] = useState(false);
    const [validNomTt, setValidNomTt] = useState(true);
    const [validNomSt, setValidNomSt] = useState(true);
    const [valTt, setValtt] = useState<Record<TarikanValidationField, boolean>>({
        rek: false,
        name: false,
        amount: false,
        hp: false,
        ket: false,
    });
    const [valSt, setValSt] = useState<Record<SetoranValidationField, boolean>>({
        rek: false,
        name: false,
        amount: false,
        namecus: false,
        source: false,
        hp: false,
        ket: false,
    });
    const [tt, setTt] = useState<TarikanTunaiForm>(createInitialTarikanForm);
    const [st, setSt] = useState<SetoranTunaiForm>(createInitialSetoranForm);

    useEffect(() => {
        clearTransactionDraftCookies();
    }, []);

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

    const flashTtValidation = (field: TarikanValidationField) => {
        setValtt((prev) => ({ ...prev, [field]: true }));
        window.setTimeout(() => {
            setValtt((prev) => ({ ...prev, [field]: false }));
        }, 2000);
    };

    const flashStValidation = (field: SetoranValidationField) => {
        setValSt((prev) => ({ ...prev, [field]: true }));
        window.setTimeout(() => {
            setValSt((prev) => ({ ...prev, [field]: false }));
        }, 2000);
    };

    const markAccountNameInvalid = () => {
        if (getStoredTransactionCategory() === TRANSACTION_CATEGORY.WITHDRAW) {
            setValtt((prev) => ({ ...prev, name: true }));
        } else {
            setValSt((prev) => ({ ...prev, name: true }));
        }
    };

    const getName = async (payload: { timestamp: string; content: string }) => {
        setLoading(true);

        try {
            const { data } = await axios({
                method: "POST",
                url: `${env.serverIp}/account-number/get-validation`,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                data: JSON.stringify(payload),
            });
            const { content } = data;
            const { accountName, branchId } = JSON.parse(d(content));

            Cookies.set("branchId", branchId, { expires: 1 });

            return accountName as string;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error("Server error:", {
                        status: error.response.status,
                        data: error.response.data,
                    });
                } else if (error.request) {
                    console.error("No response from server:", error.request);
                } else {
                    console.error("Request setup error:", error.message);
                }
            } else {
                console.error("Unexpected error:", error);
            }

            markAccountNameInvalid();

            return "";
        } finally {
            setLoading(false);
        }
    };

    const changeTt = async (event: ChangeEvent<HTMLInputElement>) => {
        const field = event.target.name as keyof TarikanTunaiForm;
        let value = event.target.value;
        let nextAccountName = tt["tt-name"];
        let nextAmountText = tt["tt-amounttext"];

        if (field === "tt-phone") {
            value =
                value.length === 0
                    ? ""
                    : normalizeNumeric(value, 15, () => flashTtValidation("hp"));
        }

        if (field === "tt-amount") {
            const digits =
                value.length === 0
                    ? ""
                    : normalizeNumeric(value, 15, () => flashTtValidation("amount"), true);

            if (digits.length === 0) {
                value = "";
                nextAmountText = "";
                setValidNomTt(true);
            } else {
                setValidNomTt(isValidNominal(digits, 10000));
                nextAmountText = toAmountText(digits);
                value = formatCurrency(digits);
            }
        }

        if (field === "tt-rek") {
            value = normalizeNumeric(value, 14, () => flashTtValidation("rek"), true);

            if (value.length === 14) {
                event.target.blur();
                nextAccountName = await getName({
                    timestamp: timestampNow(),
                    content: e(JSON.stringify({ recNumb: value })),
                });
            } else if (value.length < 14) {
                nextAccountName = "";
                setValtt((prev) => ({ ...prev, name: false }));
            }
        }

        if (field === "tt-ket") {
            if (value.length === 0) {
                value = "";
                setValtt((prev) => ({ ...prev, ket: true }));
            } else {
                value = normalizeAlphaSpace(value, 36, () => flashTtValidation("ket"));
            }
        }

        setTt((prev) => {
            const next = { ...prev, [field]: value };

            if (field !== "tt-name") next["tt-name"] = nextAccountName;
            if (field !== "tt-amounttext") next["tt-amounttext"] = nextAmountText;

            return next;
        });
    };

    const changeSt = async (event: ChangeEvent<HTMLInputElement>) => {
        const field = event.target.name as keyof SetoranTunaiForm;
        let value = event.target.value;
        let nextAccountName = st["st-rekname"];
        let nextAmountText = st["st-amounttext"];

        if (field === "st-namecus") {
            value =
                value.length === 0
                    ? ""
                    : normalizeAlphaSpace(value, 36, () => flashStValidation("namecus"));
        }

        if (field === "st-source") {
            if (value.length === 0) {
                value = "";
                setValSt((prev) => ({ ...prev, name: true }));
            } else {
                value = normalizeAlphaSpace(value, 36, () => flashStValidation("source"));
            }
        }

        if (field === "st-phone") {
            value =
                value.length === 0
                    ? ""
                    : normalizeNumeric(value, 15, () => flashStValidation("hp"));
        }

        if (field === "st-amount") {
            const digits =
                value.length === 0
                    ? ""
                    : normalizeNumeric(value, 15, () => flashStValidation("amount"), true);

            if (digits.length === 0) {
                value = "";
                nextAmountText = "";
                setValidNomSt(true);
            } else {
                setValidNomSt(isValidNominal(digits, 1000));
                nextAmountText = toAmountText(digits);
                value = formatCurrency(digits);
            }
        }

        if (field === "st-rek") {
            value = normalizeNumeric(value, 14, () => flashStValidation("rek"), true);

            if (value.length === 14) {
                event.target.blur();
                nextAccountName = await getName({
                    timestamp: timestampNow(),
                    content: e(JSON.stringify({ recNumb: value })),
                });
            } else if (value.length < 14) {
                nextAccountName = "";
            }
        }

        if (field === "st-ket") {
            if (value.length === 0) {
                value = "";
                setValSt((prev) => ({ ...prev, ket: true }));
            } else {
                value = normalizeAlphaSpace(value, 36, () => flashStValidation("ket"));
            }
        }

        setSt((prev) => {
            const next = { ...prev, [field]: value };

            if (field !== "st-rekname") next["st-rekname"] = nextAccountName;
            if (field !== "st-amounttext") next["st-amounttext"] = nextAmountText;

            return next;
        });
    };

    const submitForm = () => {
        if (category === TRANSACTION_CATEGORY.WITHDRAW) {
            const hasEmpty = Object.values(tt).some((value) => value === "");

            if (hasEmpty || !validNomTt) {
                showWarning();
            } else {
                Cookies.set(WITHDRAW_COOKIE, e(JSON.stringify(tt)), { expires: 1 });
                router.push("/validation");
            }
        } else {
            const hasEmpty = Object.values(st).some((value) => value === "");

            if (hasEmpty || !validNomSt) {
                showWarning();
            } else {
                Cookies.set(DEPOSIT_COOKIE, e(JSON.stringify(st)), { expires: 1 });
                router.push("/validation");
            }
        }
    };

    const renderActionButtons = () => (
        <div className="button-form">
            <div
                className="button-cancel"
                onClick={() => router.push("/")}
                style={{ cursor: "pointer" }}
            >
                Batal
            </div>
            <div
                className="button-next"
                onClick={submitForm}
                style={{ marginLeft: "16px", cursor: "pointer" }}
            >
                Selanjutnya
            </div>
        </div>
    );

    const renderTarikanForm = () => (
        <>
            <div className="section-form">Lengkapi <b>data transaksi</b> di bawah ini.</div>
            <div className="document-form">
                <InputGroup label="Nomor Rekening">
                    <input
                        autoComplete="off"
                        className="input-field"
                        inputMode="numeric"
                        name="tt-rek"
                        onChange={changeTt}
                        type="text"
                        value={tt["tt-rek"]}
                    />
                </InputGroup>
                {valTt.rek && <WarningMessage>* Input berupa angka dan panjang 14 digit</WarningMessage>}
                <InputGroup label="Nama Pemilik Rekening">
                    <input
                        autoComplete="off"
                        className="input-field"
                        disabled
                        name="tt-name"
                        onChange={changeTt}
                        style={DISABLED_INPUT_STYLE}
                        value={sensorNama(tt["tt-name"])}
                    />
                </InputGroup>
                {valTt.name && <WarningMessage>* Nama Pemilik Rekening Tidak Ditemukan</WarningMessage>}
                <InputGroup label="Jumlah">
                    <div style={AMOUNT_ROW_STYLE}>
                        <input
                            autoComplete="off"
                            className="input-field"
                            disabled
                            style={IDR_INPUT_STYLE}
                            value="IDR"
                        />
                        <input
                            autoComplete="off"
                            className="input-field"
                            inputMode="numeric"
                            name="tt-amount"
                            onChange={changeTt}
                            style={AMOUNT_INPUT_STYLE}
                            type="text"
                            value={tt["tt-amount"]}
                        />
                    </div>
                </InputGroup>
                {valTt.amount && <WarningMessage>* Input berupa angka dan maksimal 15 digit</WarningMessage>}
                {!validNomTt && <WarningMessage>* Input minimal dan kelipatan dari 10.000</WarningMessage>}
                <InputGroup label="Terbilang">
                    <input
                        autoComplete="off"
                        className="input-field"
                        disabled
                        name="tt-amounttext"
                        onChange={changeTt}
                        style={DISABLED_INPUT_STYLE}
                        value={tt["tt-amounttext"]}
                    />
                </InputGroup>
                <InputGroup label="Nomor Handphone">
                    <input
                        autoComplete="off"
                        className="input-field"
                        inputMode="numeric"
                        name="tt-phone"
                        onChange={changeTt}
                        type="text"
                        value={tt["tt-phone"]}
                    />
                </InputGroup>
                {valTt.hp && <WarningMessage>* Input berupa angka dan maksimal 15 digit</WarningMessage>}
                <InputGroup label="Keterangan Transaksi">
                    <input
                        autoComplete="off"
                        className="input-field"
                        name="tt-ket"
                        onChange={changeTt}
                        value={tt["tt-ket"]}
                    />
                </InputGroup>
                {valTt.ket && <WarningMessage>* Input berupa huruf dan maksimal 36 karakter</WarningMessage>}
                {renderActionButtons()}
            </div>
        </>
    );

    const renderSetoranForm = () => (
        <>
            <div className="section-form">Lengkapi <b>data transaksi</b> di bawah ini.</div>
            <div className="document-form">
                <InputGroup label="Nomor Rekening">
                    <input
                        autoComplete="off"
                        className="input-field"
                        inputMode="numeric"
                        name="st-rek"
                        onChange={changeSt}
                        type="text"
                        value={st["st-rek"]}
                    />
                </InputGroup>
                {valSt.rek && <WarningMessage>* Input berupa angka dan panjang 14 digit</WarningMessage>}
                <InputGroup label="Nama Pemilik Rekening">
                    <input
                        autoComplete="off"
                        className="input-field"
                        disabled
                        name="st-rekname"
                        onChange={changeSt}
                        style={DISABLED_INPUT_STYLE}
                        value={sensorNama(st["st-rekname"])}
                    />
                </InputGroup>
                {valSt.name && <WarningMessage>* Nama Pemilik Rekening Tidak Ditemukan</WarningMessage>}
                <InputGroup label="Jumlah">
                    <div style={AMOUNT_ROW_STYLE}>
                        <input
                            autoComplete="off"
                            className="input-field"
                            disabled
                            style={IDR_INPUT_STYLE}
                            value="IDR"
                        />
                        <input
                            autoComplete="off"
                            className="input-field"
                            inputMode="numeric"
                            name="st-amount"
                            onChange={changeSt}
                            style={AMOUNT_INPUT_STYLE}
                            type="text"
                            value={st["st-amount"]}
                        />
                    </div>
                </InputGroup>
                {valSt.amount && <WarningMessage>* Input berupa angka dan maksimal 15 digit</WarningMessage>}
                {!validNomSt && <WarningMessage>* Input minimal dan kelipatan dari 1.000</WarningMessage>}
                <InputGroup label="Terbilang">
                    <input
                        autoComplete="off"
                        className="input-field"
                        name="st-amounttext"
                        onChange={changeSt}
                        style={DISABLED_INPUT_STYLE}
                        value={st["st-amounttext"]}
                    />
                </InputGroup>
                <InputGroup label="Nama Penyetor Sesuai KTP">
                    <input
                        autoComplete="off"
                        className="input-field"
                        name="st-namecus"
                        onChange={changeSt}
                        value={st["st-namecus"]}
                    />
                </InputGroup>
                {valSt.namecus && <WarningMessage>* Input berupa huruf dan maksimal 36 karakter</WarningMessage>}
                <InputGroup label="Sumber Dana">
                    <input
                        autoComplete="off"
                        className="input-field"
                        name="st-source"
                        onChange={changeSt}
                        value={st["st-source"]}
                    />
                </InputGroup>
                {valSt.source && <WarningMessage>* Input berupa huruf dan maksimal 36 karakter</WarningMessage>}
                <InputGroup label="Nomor Handphone">
                    <input
                        autoComplete="off"
                        className="input-field"
                        inputMode="numeric"
                        name="st-phone"
                        onChange={changeSt}
                        type="text"
                        value={st["st-phone"]}
                    />
                </InputGroup>
                {valSt.hp && <WarningMessage>* Input berupa angka dan panjang maksimal 15 digit</WarningMessage>}
                <InputGroup label="Keterangan Transaksi">
                    <input
                        autoComplete="off"
                        className="input-field"
                        name="st-ket"
                        onChange={changeSt}
                        value={st["st-ket"]}
                    />
                </InputGroup>
                {valSt.ket && <WarningMessage>* Input berupa huruf dan maksimal 36 karakter</WarningMessage>}
                {renderActionButtons()}
            </div>
        </>
    );

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
            <Navbar />
            <div className="card-form invisible-scrollbar">
                <div className="progress-bar">
                    <div style={{ backgroundColor: "white" }} className="progress-start">
                        <div className="progress-title" style={{ color: "white" }}>Isi form</div>
                    </div>
                    <div style={{ backgroundColor: "#bebbbbff" }} className="progress-ongoing">
                        <div className="progress-title" style={{ color: "#bebbbbff" }}>Konfirmasi form</div>
                    </div>
                    <div style={{ backgroundColor: "#bebbbbff" }} className="progress-done">
                        <div className="progress-title" style={{ color: "#bebbbbff" }}>Reservasi</div>
                    </div>
                </div>
                <div className="title-card">
                    <div className="title-form">{title}</div>
                </div>
                <div className="card-form-section">
                    {title === TRANSACTION_TITLE[TRANSACTION_CATEGORY.WITHDRAW] && renderTarikanForm()}
                    {title === TRANSACTION_TITLE[TRANSACTION_CATEGORY.DEPOSIT] && renderSetoranForm()}
                </div>
            </div>
        </div>
    );
}
