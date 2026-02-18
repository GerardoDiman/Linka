/**
 * Demo data for the dashboard graph when no Notion workspace is connected.
 */
import type { TFunction } from 'i18next'
import type { RawDatabase, RawRelation } from './graph'
import { NODE_COLORS } from './colors'

/**
 * Creates a set of localized demo databases for the graph preview.
 */
export const createDemoDatabases = (t: TFunction): RawDatabase[] => [
    {
        id: '1',
        title: t('dashboard.demo.users'),
        properties: [
            { name: t('dashboard.demo.props.name'), type: 'title' },
            { name: t('dashboard.demo.props.email'), type: 'email' }
        ],
        color: NODE_COLORS[0],
        icon: '👤',
        url: 'https://notion.so/usuarios',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '2',
        title: t('dashboard.demo.tasks'),
        properties: [
            { name: t('dashboard.demo.props.title'), type: 'title' },
            { name: t('dashboard.demo.props.status'), type: 'status' }
        ],
        color: NODE_COLORS[1],
        icon: '✅',
        url: 'https://notion.so/tareas',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '3',
        title: t('dashboard.demo.comments'),
        properties: [
            { name: t('dashboard.demo.props.text'), type: 'rich_text' }
        ],
        color: NODE_COLORS[2],
        icon: '💬',
        url: 'https://notion.so/comentarios',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '4',
        title: t('dashboard.demo.tags'),
        properties: [
            { name: t('dashboard.demo.props.name'), type: 'title' }
        ],
        color: NODE_COLORS[3],
        icon: '🏷️',
        url: 'https://notion.so/etiquetas',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '5',
        title: t('dashboard.demo.files'),
        properties: [
            { name: 'url', type: 'url' }
        ],
        color: NODE_COLORS[4],
        icon: '📁',
        url: 'https://notion.so/archivos',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '6',
        title: t('dashboard.demo.logs'),
        properties: [
            { name: t('dashboard.demo.props.event'), type: 'rich_text' }
        ],
        color: NODE_COLORS[5],
        icon: '📜',
        url: 'https://notion.so/logs',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '7',
        title: t('dashboard.demo.config'),
        properties: [
            { name: 'key', type: 'title' },
            { name: 'value', type: 'rich_text' }
        ],
        color: NODE_COLORS[6],
        icon: '⚙️',
        url: 'https://notion.so/config',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
    {
        id: '8',
        title: t('dashboard.demo.notifications'),
        properties: [
            { name: t('dashboard.demo.props.message'), type: 'rich_text' }
        ],
        color: NODE_COLORS[7],
        icon: '🔔',
        url: 'https://notion.so/notificaciones',
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString()
    },
]

/**
 * Static demo relations between demo databases.
 */
export const DEMO_RELATIONS: RawRelation[] = [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '2', target: '4' },
    { source: '2', target: '5' },
    { source: '1', target: '8' },
    { source: '8', target: '1' },
]
