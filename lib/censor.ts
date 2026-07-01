export default function sensorNama(nama: string) {
    if (nama) {
        return nama
            .split(" ")
            .map(kata => {
                if (kata.length === 0) return "";
                return kata[0] + "*".repeat(Math.max(0, kata.length - 1));
            })
            .join(" ");
    } else {
        return nama
    }
}