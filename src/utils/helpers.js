export function getDisplayName(user) {
	const name = user?.name?.trim() || "User";
	const gender = user?.gender?.toLowerCase();

	if (gender === "male") return `Mrs. ${name}`;
	if (gender === "female") return `Miss ${name}`;

	return name;
}
