class Grammer {
    g(noun, plurality) {
        if (window.gGrammer[noun.toLowerCase()]) {
            let word = window.gGrammer[noun.toLowerCase()][plurality];
            if (noun.charAt(0).toUpperCase() === noun.charAt(0)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }
        return noun;
    }
}
export default (new Grammer()); // singleton
