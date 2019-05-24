# psarcjs
node module to read and extract Rocksmith PSARC files

## Installation
    npm install psarcjs

## Usage
```JavaScript
    
    const psarc = new PSARC('test/test.psarc');
    await psarc.parse(); /* parse file first before calling member functions */
    console.log(psarc.getFiles())
    /*
        [ 'gfxassets/album_art/album_butitrainedsong_64.dds',
          'gfxassets/album_art/album_butitrainedsong_128.dds',
          'gfxassets/album_art/album_butitrainedsong_256.dds',
          'flatmodels/rs/rsenumerable_root.flat',
        ...
    */
    console.log(await psarc.getArrangements());
    /*
        arrangements: { '00498E9999CD470BB7D310575BB85CAB':
        { ArrangementProperties:
            { bonusArr: 0,
              Metronome: 0,
              pathLead: 1,
              pathRhythm: 0,
              pathBass: 0,
    */
```

## TODO
add write support

## Tests
  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

# Projects using psarcjs
- [rs-manager](https://github.com/sandiz/rs-manager)
- [rs-designer](https://github.com/sandiz/rs-designer)

# Alternatives
- [0x0L/rs-utils](https://github.com/0x0L/rs-utils) - python module
- [BuongiornoTexas/rsr-tools](https://github.com/BuongiornoTexas/rsrtools/blob/master/rsrtools/files/welder.py) - python module 

# Thanks
- [0x0L](https://github.com/0x0L) for the original python implementation (pyrocksmith)
