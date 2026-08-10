const ValidateUserRegisration = function (data) {
	const errors = [];

	if (!data.username) {
		errors.push("username is required");
	}
	if (!data.email) {
		errors.push("email is required");
	}
	if (data.email && !data.email.includes("@")) {
		errors.push("Invalid email");
	}
	if (!data.password) {
		errors.push("Password is required");
	}
	if (data.password && data.password.length < 6) {
		errors.push("Password must be at least 6 characters");
	}
	return {
		valid: errors.length == 0,
		errors,
	};
};

export default ValidateUserRegisration;
