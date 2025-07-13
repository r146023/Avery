// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
import * as avery from 'avery';

export function createRoot(container: avery.ContainerNode): {
	render(children: avery.ComponentChild): void;
	unmount(): void;
};

export function hydrateRoot(
	container: avery.ContainerNode,
	children: avery.ComponentChild
): ReturnType<typeof createRoot>;
