export function stateValue(value: any) {
    return Buffer.from(JSON.stringify(value));
}

export function toInstance(byteItem: Uint8Array) {
    return JSON.parse(byteItem.toString());
}

// 임의의 생년월일을 생성하는 함수
export function generateBirth() {
    const ms1 = new Date('1950-01-01').getTime();
    const ms2 = new Date('2000-12-31').getTime();
    const date = new Date( Math.floor(Math.random() * (ms2 - ms1)) + ms1 );
    // 형식은 YYYYMMDD
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export function generatePhone() {
    const front = Math.floor( Math.random() * 9000 ) + 1000;
    const back = Math.floor( Math.random() * 9000 ) + 1000;
    return `010${front}${back}`;
}
