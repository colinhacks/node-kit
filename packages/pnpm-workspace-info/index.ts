import { dirname, join } from 'path'
import fg from 'fast-glob'
import { loadYamlFile, loadYamlFileSync } from 'load-yaml-file'
import { pnpmWorkspaceRoot, pnpmWorkspaceRootSync } from '@node-kit/pnpm-workspace-root'

export type ManifestInfo = Record<string, unknown> & {
	packages: string | string[]
}

export type WorkspaceInfo = Record<
	string,
	{
		path: string
	}
>

const DEFAULT_IGNORE_PATHS = [
	'**/node_modules/**',
	'**/bower_components/**',
	'**/.*/**',
	'**/__test__/**',
	'**/__tests__/**',
	'**/test/**',
	'**/tests/**'
]
const WORKSPACE_MANIFEST_FILENAME = 'pnpm-workspace.json'

/**
 * get pnpm workspace information sync function
 *
 * @param cwd - work dir
 * @returns result - workspace root dir
 */
async function pnpmWorkspaceInfo(cwd: string = process.cwd()): Promise<WorkspaceInfo | void> {
	const root = await pnpmWorkspaceRoot(cwd)
	if (!root) throw new Error('not a pnpm workspace project')

	const manifest = (await loadYamlFile(join(root, WORKSPACE_MANIFEST_FILENAME))) as ManifestInfo
	const projects = await fg(([] as string[]).concat(manifest.packages), {
		cwd: root,
		ignore: DEFAULT_IGNORE_PATHS,
		onlyDirectories: true
	})
	const workspaceInfo: WorkspaceInfo = {}
	for (const projectPath of projects) {
		workspaceInfo[dirname(projectPath)] = {
			path: projectPath
		}
	}
	return workspaceInfo
}

/**
 * get pnpm workspace information sync function
 *
 * @param cwd - work dir
 * @returns result - workspace root dir
 */
function pnpmWorkspaceInfoSync(cwd: string): WorkspaceInfo | void {
	const root = pnpmWorkspaceRootSync(cwd)
	if (!root) throw new Error('not a pnpm workspace project')

	const manifest = loadYamlFileSync(join(root, WORKSPACE_MANIFEST_FILENAME)) as ManifestInfo
	const projects = fg.sync(([] as string[]).concat(manifest.packages), {
		cwd: root,
		ignore: DEFAULT_IGNORE_PATHS,
		onlyDirectories: true
	})
	const workspaceInfo: WorkspaceInfo = {}
	for (const projectPath of projects) {
		workspaceInfo[dirname(projectPath)] = {
			path: projectPath
		}
	}
	return workspaceInfo
}

export { pnpmWorkspaceInfoSync, pnpmWorkspaceInfo, pnpmWorkspaceInfo as default }
