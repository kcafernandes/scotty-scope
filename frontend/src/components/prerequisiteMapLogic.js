export const COMPACT_LAYOUT = {
    boxWidth: 116,
    codeHeight: 34,
    tagHeight: 14,
    tagPadding: 6,
    swapHeight: 20,
    swapGap: 5,
    columnGap: 72,
    pairGap: 40,
    laneGap: 18,
    laneSpacing: 10,
    rowGap: 56,
    margin: 20,
}

export const LARGE_LAYOUT = {
    boxWidth: 184,
    codeHeight: 44,
    tagHeight: 17,
    tagPadding: 8,
    swapHeight: 24,
    swapGap: 6,
    columnGap: 84,
    pairGap: 48,
    laneGap: 22,
    laneSpacing: 12,
    rowGap: 72,
    margin: 28,
}

const ORDERING_ROUNDS = 6
const POSITIONING_ROUNDS = 8

export function choiceKey(courseCode, groupIndex) {
    return `${courseCode}|${groupIndex}`
}

export function chosenOption(choices, courseCode, groupIndex, group) {
    const chosenCode = choices[choiceKey(courseCode, groupIndex)]
    return group.find((option) => option.code === chosenCode) ?? group[0]
}

export function chooseOption(choices, courseCode, groupIndex, group, code) {
    const key = choiceKey(courseCode, groupIndex)
    const next = { ...choices }
    if (code === group[0].code) {
        delete next[key]
    } else {
        next[key] = code
    }
    return next
}

export function boxTags(link) {
    return link?.grade ? [`${link.grade} or better`] : []
}

export function swapToken(owner, groupIndex) {
    return `${owner}|${groupIndex}`.replace(/ /g, '_')
}

export function swapGroupsOf(box) {
    return box.neededFor.filter((need) => need.optionCount > 1)
}

export function requirementLabel(groupIndex, groupCount) {
    return groupCount > 1 ? `requirement ${groupIndex + 1} of ${groupCount}` : null
}

function joinList(parts) {
    return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

export function neededForText(neededFor, partners = []) {
    if (neededFor.length === 0) {
        return ''
    }
    const sameTime = (need) => need.concurrent && !partners.includes(need.owner)
    const allConcurrent = neededFor.every(sameTime)
    const parts = neededFor.map((need) => {
        const { owner, groupIndex, groupCount } = need
        const details = [requirementLabel(groupIndex, groupCount)]
        if (sameTime(need) && !allConcurrent) {
            details.push('can be taken at the same time')
        }
        const shown = details.filter(Boolean)
        return shown.length > 0 ? `${owner} (${shown.join(', ')})` : owner
    })
    return `Needed for ${joinList(parts)}.${allConcurrent ? ' Can be taken at the same time.' : ''}`
}

export function partnerText(partners) {
    return partners.length > 0 ? `Must be taken at the same time as ${joinList(partners)}.` : ''
}

function pairKey(first, second) {
    return first < second ? `${first}+${second}` : `${second}+${first}`
}

export function buildVisibleMap(mapData, choices) {
    const { top, courses } = mapData
    const boxes = new Map()
    const arrows = []
    const arrowKeys = new Set()
    const pairs = new Map()
    const expanded = new Set()

    function addBox(code) {
        if (!boxes.has(code)) {
            const course = courses[code]
            boxes.set(code, {
                code,
                title: course?.title ?? null,
                inDatabase: Boolean(course?.in_database),
                level: 0,
                link: null,
                neededFor: [],
                partners: [],
                order: boxes.size,
            })
        }
        return boxes.get(code)
    }

    function addPair(first, second) {
        const key = pairKey(first, second)
        if (!pairs.has(key)) {
            pairs.set(key, { a: first, b: second })
            boxes.get(first).partners.push(second)
            boxes.get(second).partners.push(first)
        }
    }

    function expand(code, path) {
        if (expanded.has(code)) {
            return
        }
        expanded.add(code)
        const groups = courses[code]?.groups ?? []
        groups.forEach((group, groupIndex) => {
            if (group.length === 0) {
                return
            }
            const option = chosenOption(choices, code, groupIndex, group)
            if (path.has(option.code)) {
                return
            }
            const box = addBox(option.code)
            const isChoice = group.length > 1
            if (box.link === null || (isChoice && box.link.optionCount === 1)) {
                box.link = {
                    owner: code,
                    groupIndex,
                    groupCount: groups.length,
                    concurrent: option.concurrent,
                    grade: option.grade,
                    optionCount: group.length,
                }
            }
            box.neededFor.push({
                owner: code,
                groupIndex,
                groupCount: groups.length,
                optionCount: group.length,
                concurrent: option.concurrent,
            })
            const arrowKey = `${option.code}>${code}`
            if (!arrowKeys.has(arrowKey)) {
                arrowKeys.add(arrowKey)
                arrows.push({ from: option.code, to: code })
            }
            expand(option.code, new Set(path).add(option.code))
        })
        for (const partner of courses[code]?.corequisites ?? []) {
            if (partner === code) {
                continue
            }
            addBox(partner)
            addPair(code, partner)
            expand(partner, new Set(path).add(partner))
        }
    }

    addBox(top)
    expand(top, new Set([top]))

    const blockOf = groupIntoBlocks(boxes, pairs)
    const keptArrows = arrows.filter((arrow) => blockOf.get(arrow.from) !== blockOf.get(arrow.to))
    const blocks = assignLevels(boxes, keptArrows, pairs, blockOf, top)

    return {
        top,
        boxes: [...boxes.values()],
        arrows: keptArrows,
        pairs: [...pairs.values()].filter((pair) => blocks.get(pair.a) === blocks.get(pair.b)),
        blocks,
    }
}

function groupIntoBlocks(boxes, pairs) {
    const parent = new Map([...boxes.keys()].map((code) => [code, code]))
    function find(code) {
        while (parent.get(code) !== code) {
            parent.set(code, parent.get(parent.get(code)))
            code = parent.get(code)
        }
        return code
    }
    for (const { a, b } of pairs.values()) {
        parent.set(find(a), find(b))
    }
    return new Map([...boxes.keys()].map((code) => [code, find(code)]))
}

function chainOrder(members, pairs, boxes) {
    const neighbors = new Map(members.map((code) => [code, []]))
    for (const { a, b } of pairs) {
        if (neighbors.has(a) && neighbors.has(b)) {
            neighbors.get(a).push(b)
            neighbors.get(b).push(a)
        }
    }
    const byOrder = [...members].sort((x, y) => boxes.get(x).order - boxes.get(y).order)
    const start = byOrder.find((code) => neighbors.get(code).length <= 1) ?? byOrder[0]
    const ordered = []
    const visited = new Set()
    const stack = [start]
    while (stack.length > 0) {
        const code = stack.pop()
        if (visited.has(code)) {
            continue
        }
        visited.add(code)
        ordered.push(code)
        const next = neighbors.get(code)
            .filter((neighbor) => !visited.has(neighbor))
            .sort((x, y) => boxes.get(y).order - boxes.get(x).order)
        stack.push(...next)
    }
    return ordered
}

function levelBlocks(blockOf, arrows, top) {
    const needs = new Map()
    const waitingOn = new Map()
    for (const block of new Set(blockOf.values())) {
        needs.set(block, new Set())
        waitingOn.set(block, 0)
    }
    for (const { from, to } of arrows) {
        const fromBlock = blockOf.get(from)
        const toBlock = blockOf.get(to)
        if (!needs.get(toBlock).has(fromBlock)) {
            needs.get(toBlock).add(fromBlock)
            waitingOn.set(fromBlock, waitingOn.get(fromBlock) + 1)
        }
    }
    const levels = new Map([[blockOf.get(top), 0]])
    const queue = [blockOf.get(top)]
    const done = new Set()
    while (queue.length > 0) {
        const block = queue.shift()
        done.add(block)
        for (const prerequisite of needs.get(block)) {
            levels.set(prerequisite, Math.max(levels.get(prerequisite) ?? 0, levels.get(block) + 1))
            waitingOn.set(prerequisite, waitingOn.get(prerequisite) - 1)
            if (waitingOn.get(prerequisite) === 0) {
                queue.push(prerequisite)
            }
        }
    }
    return { levels, stuck: [...needs.keys()].filter((block) => !done.has(block)) }
}

function assignLevels(boxes, arrows, pairs, blockOf, top) {
    let blocks = new Map(blockOf)
    let result = levelBlocks(blocks, arrows, top)
    if (result.stuck.length > 0) {
        const stuck = new Set(result.stuck)
        blocks = new Map([...blocks].map(([code, block]) => [code, stuck.has(block) ? code : block]))
        result = levelBlocks(blocks, arrows, top)
    }
    for (const box of boxes.values()) {
        box.level = result.levels.get(blocks.get(box.code)) ?? 0
    }
    return blocks
}

function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length
}

function measureBox(box, config) {
    const tags = boxTags(box.link)
    const boxHeight = config.codeHeight + (tags.length > 0 ? tags.length * config.tagHeight + config.tagPadding : 0)
    const hasSwap = swapGroupsOf(box).length > 0
    return {
        boxHeight,
        hasSwap,
        unitHeight: boxHeight + (hasSwap ? config.swapGap + config.swapHeight : 0),
    }
}

function buildLayers(visible, config) {
    const items = new Map()
    const rows = []
    const up = new Map()
    const down = new Map()
    const boxes = new Map(visible.boxes.map((box) => [box.code, box]))

    function addItem(item) {
        items.set(item.id, item)
        up.set(item.id, [])
        down.set(item.id, [])
        if (!rows[item.level]) {
            rows[item.level] = []
        }
        rows[item.level].push(item.id)
    }

    const membersOf = new Map()
    for (const box of visible.boxes) {
        const block = visible.blocks.get(box.code)
        if (!membersOf.has(block)) {
            membersOf.set(block, [])
        }
        membersOf.get(block).push(box.code)
    }
    const memberOffset = new Map()
    const slot = config.boxWidth + config.pairGap
    for (const [block, members] of membersOf) {
        const ordered = chainOrder(members, visible.pairs, boxes)
        const width = ordered.length * config.boxWidth + (ordered.length - 1) * config.pairGap
        ordered.forEach((code, index) => memberOffset.set(code, -width / 2 + config.boxWidth / 2 + index * slot))
        addItem({ id: block, level: boxes.get(ordered[0]).level, isBox: true, width, members: ordered })
    }

    const levelOf = new Map(visible.boxes.map((box) => [box.code, box.level]))
    const chains = visible.arrows.map((arrow) => {
        const chain = [visible.blocks.get(arrow.from)]
        for (let level = levelOf.get(arrow.from) - 1; level > levelOf.get(arrow.to); level -= 1) {
            const id = `${arrow.from}>${arrow.to}@${level}`
            addItem({ id, level, isBox: false, width: 0 })
            chain.push(id)
        }
        chain.push(visible.blocks.get(arrow.to))
        for (let index = 0; index < chain.length - 1; index += 1) {
            up.get(chain[index]).push(chain[index + 1])
            down.get(chain[index + 1]).push(chain[index])
        }
        return { ...arrow, chain }
    })

    return { items, rows, up, down, chains, memberOffset }
}

function countCrossings(upperRow, lowerRow, up) {
    const upperIndex = new Map(upperRow.map((id, index) => [id, index]))
    const edges = []
    lowerRow.forEach((id, lowerIndex) => {
        for (const upper of up.get(id)) {
            edges.push([upperIndex.get(upper), lowerIndex])
        }
    })
    let crossings = 0
    for (let a = 0; a < edges.length; a += 1) {
        for (let b = a + 1; b < edges.length; b += 1) {
            if ((edges[a][0] - edges[b][0]) * (edges[a][1] - edges[b][1]) < 0) {
                crossings += 1
            }
        }
    }
    return crossings
}

function totalCrossings(rows, up) {
    let total = 0
    for (let level = 1; level < rows.length; level += 1) {
        total += countCrossings(rows[level - 1], rows[level], up)
    }
    return total
}

function reorderRow(row, neighborRow, neighborsOf) {
    const neighborIndex = new Map(neighborRow.map((id, index) => [id, index]))
    const keyed = row.map((id, index) => {
        const neighbors = neighborsOf.get(id)
        const key = neighbors.length > 0
            ? average(neighbors.map((neighbor) => neighborIndex.get(neighbor)))
            : index * (neighborRow.length / Math.max(row.length, 1))
        return { id, key, index }
    })
    keyed.sort((a, b) => a.key - b.key || a.index - b.index)
    return keyed.map((entry) => entry.id)
}

function orderRows(rows, up, down) {
    let best = rows.map((row) => [...row])
    let bestCrossings = totalCrossings(best, up)
    let current = best.map((row) => [...row])
    for (let round = 0; round < ORDERING_ROUNDS && bestCrossings > 0; round += 1) {
        for (let level = 1; level < current.length; level += 1) {
            current[level] = reorderRow(current[level], current[level - 1], up)
        }
        for (let level = current.length - 2; level >= 0; level -= 1) {
            current[level] = reorderRow(current[level], current[level + 1], down)
        }
        const crossings = totalCrossings(current, up)
        if (crossings < bestCrossings) {
            best = current.map((row) => [...row])
            bestCrossings = crossings
        }
    }
    return best
}

function separation(first, second, config) {
    const halves = first.width / 2 + second.width / 2
    if (first.isBox && second.isBox) {
        return halves + config.columnGap
    }
    if (first.isBox || second.isBox) {
        return halves + config.laneGap
    }
    return config.laneSpacing
}

function placeRow(row, wanted, items, config) {
    const fromLeft = []
    const fromRight = []
    let lastBoxRight = -Infinity
    row.forEach((id, index) => {
        const item = items.get(id)
        let value = wanted[index]
        if (index > 0) {
            value = Math.max(value, fromLeft[index - 1] + separation(items.get(row[index - 1]), item, config))
        }
        if (item.isBox) {
            value = Math.max(value, lastBoxRight + config.columnGap + item.width / 2)
            lastBoxRight = value + item.width / 2
        }
        fromLeft[index] = value
    })
    let nextBoxLeft = Infinity
    for (let index = row.length - 1; index >= 0; index -= 1) {
        const item = items.get(row[index])
        let value = wanted[index]
        if (index < row.length - 1) {
            value = Math.min(value, fromRight[index + 1] - separation(item, items.get(row[index + 1]), config))
        }
        if (item.isBox) {
            value = Math.min(value, nextBoxLeft - config.columnGap - item.width / 2)
            nextBoxLeft = value - item.width / 2
        }
        fromRight[index] = value
    }
    return row.map((_, index) => (fromLeft[index] + fromRight[index]) / 2)
}

function positionRows(rows, up, down, items, config) {
    const x = new Map()
    for (const row of rows) {
        let next = 0
        row.forEach((id, index) => {
            if (index > 0) {
                next += separation(items.get(row[index - 1]), items.get(id), config)
            }
            x.set(id, next)
        })
        const shift = next / 2
        row.forEach((id) => x.set(id, x.get(id) - shift))
    }

    function pass(levels, neighborsOf) {
        for (const level of levels) {
            const row = rows[level]
            const wanted = row.map((id) => {
                const neighbors = neighborsOf.get(id)
                return neighbors.length > 0 ? average(neighbors.map((neighbor) => x.get(neighbor))) : x.get(id)
            })
            placeRow(row, wanted, items, config).forEach((value, index) => x.set(row[index], value))
        }
    }

    const downward = rows.map((_, level) => level).slice(1)
    const upward = rows.map((_, level) => level).reverse().slice(1)
    for (let round = 0; round < POSITIONING_ROUNDS; round += 1) {
        pass(downward, up)
        pass(upward, down)
    }
    return x
}

function spreadPoints(center, count, width) {
    const spacing = count > 1 ? Math.min(22, (width * 0.7) / (count - 1)) : 0
    return Array.from({ length: count }, (_, index) => center + (index - (count - 1) / 2) * spacing)
}

function direction(from, to) {
    return Math.abs(to - from) < 0.5 ? 0 : Math.sign(to - from)
}

function roundedPath(rawPoints) {
    const points = rawPoints.map(([x, y]) => [Math.round(x), Math.round(y)])
    const cleaned = points.filter((point, index) => {
        const previous = points[index - 1]
        return !previous || Math.abs(previous[0] - point[0]) > 0.5 || Math.abs(previous[1] - point[1]) > 0.5
    })
    const corners = cleaned.filter((point, index) => {
        const previous = cleaned[index - 1]
        const next = cleaned[index + 1]
        if (!previous || !next) {
            return true
        }
        const straight = (Math.abs(previous[0] - point[0]) < 0.5 && Math.abs(point[0] - next[0]) < 0.5)
            || (Math.abs(previous[1] - point[1]) < 0.5 && Math.abs(point[1] - next[1]) < 0.5)
        return !straight
    })

    const parts = [`M ${corners[0][0]} ${corners[0][1]}`]
    for (let index = 1; index < corners.length - 1; index += 1) {
        const [px, py] = corners[index - 1]
        const [cx, cy] = corners[index]
        const [nx, ny] = corners[index + 1]
        const radius = Math.min(
            8,
            Math.hypot(cx - px, cy - py) / 2,
            Math.hypot(nx - cx, ny - cy) / 2,
        )
        const inX = cx - direction(px, cx) * radius
        const inY = cy - direction(py, cy) * radius
        const outX = cx + direction(cx, nx) * radius
        const outY = cy + direction(cy, ny) * radius
        parts.push(`L ${inX} ${inY}`, `Q ${cx} ${cy} ${outX} ${outY}`)
    }
    const last = corners[corners.length - 1]
    parts.push(`L ${last[0]} ${last[1]}`)
    return { path: parts.join(' '), points: corners }
}

export function layoutMap(visible, config) {
    const { items, rows: layers, up, down, chains, memberOffset } = buildLayers(visible, config)
    const rows = orderRows(layers, up, down)
    const x = positionRows(rows, up, down, items, config)

    const sizes = new Map(visible.boxes.map((box) => [box.code, measureBox(box, config)]))
    const rowTops = []
    const rowBottoms = []
    let nextTop = config.margin
    rows.forEach((row, level) => {
        rowTops[level] = nextTop
        const heights = row
            .filter((id) => items.get(id).isBox)
            .flatMap((id) => items.get(id).members.map((code) => sizes.get(code).unitHeight))
        rowBottoms[level] = nextTop + Math.max(...heights)
        nextTop = rowBottoms[level] + config.rowGap
    })

    const edges = [...items.keys()].map((id) => [x.get(id) - items.get(id).width / 2, x.get(id) + items.get(id).width / 2])
    const minX = Math.min(...edges.map(([left]) => left))
    const maxX = Math.max(...edges.map(([, right]) => right))
    const offset = config.margin - minX
    const width = maxX - minX + config.margin * 2
    const height = nextTop - config.rowGap + config.margin
    const centerOf = (id) => x.get(id) + offset
    const boxCenter = (code) => centerOf(visible.blocks.get(code)) + memberOffset.get(code)

    const nodes = visible.boxes.map((box) => ({
        ...box,
        ...sizes.get(box.code),
        centerX: boxCenter(box.code),
        left: boxCenter(box.code) - config.boxWidth / 2,
        top: rowTops[box.level],
    }))
    const nodesByCode = new Map(nodes.map((node) => [node.code, node]))

    const laneOffsets = new Map()
    for (let level = 0; level < rows.length - 1; level += 1) {
        const uppers = rows[level].filter((id) => down.get(id).length > 0)
        uppers.sort((a, b) => centerOf(a) - centerOf(b))
        const spacing = uppers.length > 1 ? Math.min(7, (config.rowGap * 0.45) / (uppers.length - 1)) : 0
        uppers.forEach((id, index) => laneOffsets.set(id, (index - (uppers.length - 1) / 2) * spacing))
    }

    function pointX(chain, index) {
        if (index === 0) {
            return boxCenter(chain.from)
        }
        if (index === chain.chain.length - 1) {
            return boxCenter(chain.to)
        }
        return centerOf(chain.chain[index])
    }

    const entries = new Map()
    const exits = new Map()
    for (const node of nodes) {
        const incoming = chains.filter((chain) => chain.to === node.code)
        incoming.sort((a, b) => pointX(a, a.chain.length - 2) - pointX(b, b.chain.length - 2))
        spreadPoints(node.centerX, incoming.length, config.boxWidth)
            .forEach((value, index) => entries.set(`${incoming[index].from}>${node.code}`, value))

        const outgoing = chains.filter((chain) => chain.from === node.code)
        outgoing.sort((a, b) => pointX(a, 1) - pointX(b, 1))
        spreadPoints(node.centerX, outgoing.length, config.boxWidth)
            .forEach((value, index) => exits.set(`${node.code}>${outgoing[index].to}`, value))
    }

    const arrows = chains.map((chain) => {
        const key = `${chain.from}>${chain.to}`
        const source = nodesByCode.get(chain.from)
        const target = nodesByCode.get(chain.to)
        const points = [[exits.get(key), source.top]]
        for (let index = 1; index < chain.chain.length; index += 1) {
            const upper = chain.chain[index]
            const upperLevel = items.get(upper).level
            const gapY = rowBottoms[upperLevel] + config.rowGap / 2 + laneOffsets.get(upper)
            const upperX = index === chain.chain.length - 1 ? entries.get(key) : pointX(chain, index)
            points.push([points[points.length - 1][0], gapY], [upperX, gapY])
        }
        points.push([entries.get(key), target.top + target.unitHeight + 3])
        return { from: chain.from, to: chain.to, ...roundedPath(points) }
    })

    const pairLines = []
    for (const item of items.values()) {
        if (!item.isBox) {
            continue
        }
        for (let index = 0; index < item.members.length - 1; index += 1) {
            const left = nodesByCode.get(item.members[index])
            const right = nodesByCode.get(item.members[index + 1])
            const linked = visible.pairs.some((pair) => pairKey(pair.a, pair.b) === pairKey(left.code, right.code))
            if (!linked) {
                continue
            }
            const y = Math.round(left.top + Math.min(left.boxHeight, right.boxHeight) / 2)
            pairLines.push({
                a: left.code,
                b: right.code,
                x1: Math.round(left.left + config.boxWidth),
                x2: Math.round(right.left),
                y,
            })
        }
    }

    return {
        width,
        height,
        focusCenter: centerOf(visible.blocks.get(visible.top)),
        nodes: nodes.sort((a, b) => a.level - b.level || a.left - b.left),
        arrows,
        pairLines,
    }
}
