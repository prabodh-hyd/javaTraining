class SqueakyClean {
    static String clean(String identifier) {
        if (identifier == null || identifier.isEmpty()) {
            return identifier;
        }
        String kebab = identifier.replace(' ', '_');
        StringBuilder camel = new StringBuilder();
        boolean capitalizeNext = false;
    
        for (char c : kebab.toCharArray()) {
            if (c == '-') {
                capitalizeNext = true;
            } else {
                if (capitalizeNext) {
                    camel.append(Character.toUpperCase(c));
                    capitalizeNext = false;
                } else {
                    camel.append(c);
                }
            }
        }
    
        kebab = camel.toString();
        String leettext = kebab
            .replace('4', 'a')
            .replace('3', 'e')
            .replace('1', 'l')
            .replace('0', 'o')
            .replace('7', 't')
            .replace('5', 's');
        return leettext.replaceAll("[()?:!.¡*,;#$&@{}]+", "");
    }
}
