export default function recNumbMasking(rec: string) {
    if (rec) {
       return rec.slice(0, 3) + "*".repeat(6) + rec.slice(11)
       
    } else {
        return rec
    }
}