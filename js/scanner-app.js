// ========================================
// FL Municipal Zoning Scanner - App Logic
// ========================================

(function() {
    'use strict';

    // ---- State ----
    const state = {
        data: null,
        filteredMunicipalities: [],
        activeRegion: 'all',
        searchText: '',
        gridView: false
    };

    // ---- DOM Refs ----
    const $ = id => document.getElementById(id);
    const feed = $('scanner-feed');
    const loadingSpinner = $('loading-spinner');
    const emptyState = $('empty-state');
    const searchInput = $('search-input');

    // ---- Initialization ----
    function init() {
        state.data = generateScannerData();
        setupEventListeners();
        updateStats();
        buildRegionTabs();
        renderFeed();
        loadingSpinner.classList.add('hidden');
    }

    // ---- Stats ----
    function updateStats() {
        const d = state.data;
        $('stat-municipalities').textContent = d.successful_scans;
        $('stat-documents').textContent = d.total_documents;

        // Count total actions
        let totalActions = 0;
        d.municipalities.forEach(m => {
            Object.values(m.action_counts || {}).forEach(c => { totalActions += c; });
        });
        $('stat-actions').textContent = totalActions;

        const scanDate = new Date(d.scan_time);
        $('stat-date').textContent = scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // ---- Region Tabs ----
    function buildRegionTabs() {
        const container = $('region-tabs');
        const regions = new Set();
        state.data.municipalities.forEach(m => regions.add(m.region));

        let html = '<button class="region-tab active" data-region="all">All</button>';
        Array.from(regions).sort().forEach(r => {
            html += `<button class="region-tab" data-region="${escapeHtml(r)}">${escapeHtml(r)}</button>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.region-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.activeRegion = tab.dataset.region;
                renderFeed();
            });
        });
    }

    // ---- Filtering ----
    function getFilteredMunicipalities() {
        let list = state.data.municipalities;

        if (state.activeRegion !== 'all') {
            list = list.filter(m => m.region === state.activeRegion);
        }

        if (state.searchText) {
            const q = state.searchText.toLowerCase();
            list = list.filter(m => {
                // Search in municipality name, county, summary
                if (m.name.toLowerCase().includes(q)) return true;
                if (m.county.toLowerCase().includes(q)) return true;
                if ((m.summary || '').toLowerCase().includes(q)) return true;
                // Search in documents
                return (m.documents || []).some(doc => {
                    if (doc.title.toLowerCase().includes(q)) return true;
                    return (doc.actions || []).some(a =>
                        a.description.toLowerCase().includes(q) ||
                        a.type.toLowerCase().includes(q)
                    );
                });
            });
        }

        return list;
    }

    // ---- Rendering ----
    function renderFeed() {
        const munis = getFilteredMunicipalities();
        state.filteredMunicipalities = munis;

        if (munis.length === 0) {
            feed.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        feed.innerHTML = '';

        munis.forEach(muni => {
            feed.appendChild(createMuniCard(muni));
        });
    }

    function createMuniCard(muni) {
        const card = document.createElement('div');
        card.className = 'muni-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        const docCount = muni.documents_found || 0;
        const badgeClass = docCount === 0 ? 'zero' : '';

        // Build action pills
        let actionPillsHtml = '';
        const actionEntries = Object.entries(muni.action_counts || {});
        if (actionEntries.length > 0) {
            actionPillsHtml = '<div class="action-pills">';
            actionEntries.forEach(([type, count]) => {
                const cls = actionPillClass(type);
                actionPillsHtml += `<span class="action-pill ${cls}">${count} ${escapeHtml(type)}</span>`;
            });
            actionPillsHtml += '</div>';
        }

        // Build doc list preview (max 2)
        let docListHtml = '';
        const docs = muni.documents || [];
        if (docs.length > 0) {
            docListHtml = '<ul class="muni-card-docs">';
            docs.slice(0, 2).forEach(doc => {
                docListHtml += `
                    <li class="muni-card-doc-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span>
                            <span class="muni-card-doc-title">${escapeHtml(doc.title)}</span>
                            <span class="muni-card-doc-type">${escapeHtml(doc.type)}</span>
                        </span>
                    </li>
                `;
            });
            if (docs.length > 2) {
                docListHtml += `<li class="muni-card-doc-item" style="color:var(--text-secondary);">+${docs.length - 2} more document(s)</li>`;
            }
            docListHtml += '</ul>';
        }

        card.innerHTML = `
            <div class="muni-card-header">
                <div>
                    <div class="muni-card-name">${escapeHtml(muni.name)}</div>
                    <div class="muni-card-county">${escapeHtml(muni.county)} County</div>
                </div>
                <span class="muni-doc-badge ${badgeClass}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    ${docCount}
                </span>
            </div>
            <span class="muni-card-region">${escapeHtml(muni.region)}</span>
            ${actionPillsHtml}
            ${docListHtml}
        `;

        card.addEventListener('click', () => showDetail(muni));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter') showDetail(muni);
        });

        return card;
    }

    // ---- Detail View ----
    function showDetail(muni) {
        const modal = $('detail-modal');
        const body = $('detail-body');

        const docs = muni.documents || [];
        const totalActions = Object.values(muni.action_counts || {}).reduce((s, c) => s + c, 0);

        let docsHtml = '';
        docs.forEach(doc => {
            let actionsHtml = '';
            (doc.actions || []).forEach(action => {
                const colorClass = actionColorClass(action.type);
                actionsHtml += `
                    <div class="detail-action-item">
                        <div class="detail-action-type" style="color:${colorClass}">${escapeHtml(action.type)}</div>
                        <div class="detail-action-desc">${escapeHtml(action.description)}</div>
                    </div>
                `;
            });

            let detailsHtml = '';
            const details = doc.details || {};
            if (Object.keys(details).length > 0) {
                detailsHtml = '<div class="detail-extracted">';
                if (details.case_numbers && details.case_numbers.length > 0) {
                    detailsHtml += '<div style="margin-bottom:6px;"><span class="info-label">Case Numbers</span><br>';
                    details.case_numbers.forEach(cn => {
                        detailsHtml += `<span class="detail-tag">${escapeHtml(cn)}</span> `;
                    });
                    detailsHtml += '</div>';
                }
                if (details.addresses && details.addresses.length > 0) {
                    detailsHtml += '<div style="margin-bottom:6px;"><span class="info-label">Addresses</span><br>';
                    details.addresses.forEach(a => {
                        detailsHtml += `<span class="detail-tag">${escapeHtml(a)}</span> `;
                    });
                    detailsHtml += '</div>';
                }
                if (details.units && details.units.length > 0) {
                    detailsHtml += `<div style="margin-bottom:6px;"><span class="info-label">Units</span><br>`;
                    details.units.forEach(u => {
                        detailsHtml += `<span class="detail-tag">${u} units</span> `;
                    });
                    detailsHtml += '</div>';
                }
                if (details.acreage && details.acreage.length > 0) {
                    detailsHtml += `<div><span class="info-label">Acreage</span><br>`;
                    details.acreage.forEach(a => {
                        detailsHtml += `<span class="detail-tag">${a} acres</span> `;
                    });
                    detailsHtml += '</div>';
                }
                detailsHtml += '</div>';
            }

            docsHtml += `
                <div class="detail-doc-card">
                    <div class="detail-doc-title">${escapeHtml(doc.title)}</div>
                    <span class="detail-doc-type-badge">${escapeHtml(doc.type)}</span>
                    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">
                        Relevance: ${doc.relevance_score || '--'}/100
                    </div>
                    ${actionsHtml}
                    ${detailsHtml}
                </div>
            `;
        });

        if (docs.length === 0) {
            docsHtml = `
                <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p style="margin-top:12px;">No planning/zoning documents found in today's scan.</p>
                </div>
            `;
        }

        body.innerHTML = `
            <div class="detail-muni-header">
                <div class="detail-muni-name">${escapeHtml(muni.name)}</div>
                <div class="detail-muni-info">${escapeHtml(muni.county)} County &middot; ${escapeHtml(muni.region)}</div>
                <div class="detail-muni-stats">
                    <div class="detail-muni-stat">
                        <div class="detail-muni-stat-value">${docs.length}</div>
                        <div class="detail-muni-stat-label">Documents</div>
                    </div>
                    <div class="detail-muni-stat">
                        <div class="detail-muni-stat-value">${totalActions}</div>
                        <div class="detail-muni-stat-label">Actions</div>
                    </div>
                </div>
            </div>

            <div style="padding:0 16px 8px;"><h3 style="font-size:16px;font-weight:600;">Documents Found</h3></div>
            ${docsHtml}
        `;

        openModal(modal);
    }

    // ---- Modal Management ----
    function openModal(modal) {
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modal.classList.add('visible');
            });
        });
    }

    function closeModal(modal) {
        modal.classList.remove('visible');
        modal.addEventListener('transitionend', function handler() {
            modal.classList.add('hidden');
            modal.removeEventListener('transitionend', handler);
        });
    }

    // ---- Event Listeners ----
    function setupEventListeners() {
        // Search
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.searchText = searchInput.value.trim();
                renderFeed();
            }, 300);
        });

        // Detail back
        $('detail-back-btn').addEventListener('click', () => {
            closeModal($('detail-modal'));
        });

        // View toggle
        $('view-toggle-btn').addEventListener('click', () => {
            state.gridView = !state.gridView;
            feed.classList.toggle('grid-view', state.gridView);
        });
    }

    // ---- Helpers ----
    function actionPillClass(type) {
        const map = {
            'Approved': 'approved',
            'Denied': 'denied',
            'Deferred': 'deferred',
            'Public Hearing': 'hearing',
            'Rezoning': 'rezoning',
            'Site Plan': 'site-plan',
            'Recommended': 'recommended',
            'Variance': 'variance'
        };
        return map[type] || '';
    }

    function actionColorClass(type) {
        const map = {
            'Approved': 'var(--green)',
            'Denied': 'var(--red)',
            'Deferred': 'var(--orange)',
            'Public Hearing': 'var(--blue)',
            'Rezoning': '#6b21a8',
            'Site Plan': '#0d6948',
            'Recommended': 'var(--green)',
            'Variance': 'var(--orange)'
        };
        return map[type] || 'var(--text-secondary)';
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- Start ----
    document.addEventListener('DOMContentLoaded', init);
})();
