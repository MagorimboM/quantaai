export function isPdf (file:Buffer){
    const signature = file.subarray(0, 4).toString("ascii"); 
    return signature == "%PDF"; 
}; 



