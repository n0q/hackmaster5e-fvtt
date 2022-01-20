# Contributing

This project is still in the "core functionality" stages, so viable contributions are slim pickings for now. Still, it's not a bad idea for me to detail setup for documentation purposes.

As I'm relatively new to javascript, my toolchain is simple and straight forward. I don't believe you should have trouble getting this to go, but let me know if there are any snags. I use linux and vim and I'm not entirely sure what the right way to go about things would be in other environments, so I'll try my best to provide system agnostic instructions.

#### Environment
1. Install [npm](https://nodejs.org/en/) however is best for your system.
2. Globally install gulp from commandline: `npm install gulp-cli -g`
3. `git clone https://github.com/n0q/hackmaster5e-fvtt`
4. From `hackmaster5e-fvtt`, I strongly recommend creating a symlink or shortcut named `foundry` which links into your foundry install, specifically to `resources/app/public` so we can reference it later for hinting/autocompletion.
5. Create a jsconfig.json to reference the symlink/shortcut you just made:
```javascript
{
    "include": ["hm.js", "modules/**/*", "foundry/scripts/*.js"],
    "exclude": ["node_modules"]
}
```
6. Install the needed npm modules by going to your `hackmaster5e-fvtt` directory and typing: `npm ci`
7. Build the initial style sheet: `gulp sass`
8. Create a symlink/shortcut from your `hackmaster5e-fvtt` repo to `Data/system/hackmaster5e`
9. From within the foundry program, check that hackmaster shows up on your systems list. Make sure to **lock** your hackmaster system, or your environment will be blown away the next time you update your systems.

Keep `gulp` running on its default task while you work so it can spit out eslint warnings and rebuild the style sheet if you touch the scss files. Contributions should be pushed to dev.
