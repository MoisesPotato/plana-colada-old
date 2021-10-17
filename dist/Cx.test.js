const { exp } = require("mathjs");
const { Cx } = require("./Cx")

describe('Cx',() => {
    const one = new Cx(1,0);
    const i = new Cx(0,1);
    const infty = Cx.infty();
    const twoplusi = new Cx(2, 1);

    beforeEach(() =>{
    })

    it('adds 1 + i', () => {
        const c = one.plus(i);
        expect(c.re).toBe(1);
        expect(c.im).toBe(1);
        const compare = c.compare(1,1);
        expect(compare).toBe(true);
    })

    it('recognizes infty', () => {
        expect(infty.isInfty()).toBe(true);
    })

    it('multiplies', () => {
        expect(twoplusi.times(i)).toEqual(i.times(twoplusi));
        const c = i.times(twoplusi).compare(-1, 2);
        expect(c).toBe(true);
    })
    
}


)