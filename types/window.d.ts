declare interface Window {
    RoCodelms: any;
    Lang: any;
    popupHelper?: import('../src/class/popup_helper').default;
    RoCodeStatic: any;
    ImageCapture: any;
}

declare var Lang: any;
declare var RoCodelms: any;
declare var RoCodeStatic: any;
declare var ImageCapture: any;

declare module '*.worker.ts' {
    var value: new () => Worker;
    export = value;
}

declare module '@egjs/*' {
    const value: any;
    export default value;
}
