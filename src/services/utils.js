export const calcolateFileHash = (file) => {

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
        
            const encoder = new TextEncoder();
            const data = encoder.encode(reader.result);

            crypto.subtle.digest('SHA-256', data)
            .then(hash => {

                let hexes = [];
                let view = new DataView(hash);

                for (let i = 0; i < view.byteLength; i += 4) {
                    hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
                }
                    
                resolve(hexes.join(''))
            });
        }

        reader.readAsText(file);
    });
}

export const formDataToJson = (formData) => {

    let object = {};

    for(const entry of formData.entries()) {
        object[entry[0]] = entry[1];
    }

    return object;
}