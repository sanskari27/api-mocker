const generateRuleId = (): string => {
	return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateEnvironmentId = (): string => {
	return `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export { generateEnvironmentId, generateRuleId };
