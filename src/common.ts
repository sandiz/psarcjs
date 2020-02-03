export const toTitleCase = function (str: string) {
    return str.replace(/\w\S*/g, function (txt: string) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
export const objectMap = (object: { [key: string]: any }, mapFn: (item: any) => void) => {
    return Object.keys(object).reduce(function (result: { [key: string]: any }, key: string) {
        result[key] = mapFn(object[key])
        return result
    }, {})
}

export const DEFAULT_VALUES = {
    SCROLL_SPEED: 13,
    VOLUME: -7.0,
    PREVIEW_VOLUME: -7.0,
}