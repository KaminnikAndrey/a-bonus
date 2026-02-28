// declare module 'react-native-config' {
//     export interface NativeConfig {
//         BASE_SERVER_URL?: string;
//     }
    
//     export const Config: NativeConfig
//     export default Config
// }

//конфиг при сборке не работает. почему? мне лень разбираться поэтому я делал все хардкодом в authApi и commonApi

declare module 'base-64' {
    export function encode(input: string): string;
    export function decode(input: string): string;
}