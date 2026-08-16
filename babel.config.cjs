// babel.config.cjs
// RIGHT — targets is wrapped as the second element of a [name, options] pair
module.exports = {
	presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
