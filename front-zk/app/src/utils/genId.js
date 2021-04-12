import format from '../helpers/format';

const genId = async (toHash) => {
    const hasher = await import('witness');
    const to_witness = hasher.genId(toHash);
    console.log(JSON.parse(to_witness));
    const format_witness = format.toZokFormat8(to_witness);
    console.log(format.toZokFormat32(to_witness));
    return JSON.stringify(format_witness);
}

export default genId;
