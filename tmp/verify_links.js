const providers = ['Alibaba', 'AliExpress', 'CJdropshipping', '1688', 'Amazon'];
const products = ['Galaxy Projector', 'Neck Massager', 'Wireless Earbuds'];

function getLink(platform, name) {
    const searchTerm = encodeURIComponent(name);
    let url = '';
    const plat = platform.toLowerCase();

    if (plat.includes('alibaba')) {
        url = `https://www.alibaba.com/trade/search?SearchText=${searchTerm}`;
    } else if (plat.includes('aliexpress')) {
        url = `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}`;
    } else if (plat.includes('cj')) {
        url = `https://cjdropshipping.com/product-list?search=${searchTerm}`;
    } else if (plat.includes('1688')) {
        url = `https://s.1688.com/youyuan/index.htm?keywords=${searchTerm}`;
    } else {
        url = `https://www.google.com/search?q=${searchTerm}+supplier`;
    }
    return url;
}

console.log("Verificando generación de enlaces:");
products.forEach(p => {
    console.log(`\nProducto: ${p}`);
    providers.forEach(prov => {
        console.log(`${prov}: ${getLink(prov, p)}`);
    });
});
