// ========================================
// FL Water Permit Tracker - App Logic
// ========================================

(function() {
    'use strict';

    // ---- State ----
    const state = {
        allPermits: [],
        displayedPermits: [],
        currentPage: 0,
        pageSize: 8,
        hasMore: true,
        isLoading: false,
        lastUpdated: null,
        filters: {
            districts: new Set(Object.keys(DISTRICTS)),
            statuses: new Set(['New Application', 'Approved']),
            sortOrder: 'newest',
            searchText: ''
        }
    };

    // ---- DOM Refs ----
    const $ = id => document.getElementById(id);
    const feed = $('permit-feed');
    const loadingSpinner = $('loading-spinner');
    const loadMore = $('load-more');
    const endOfList = $('end-of-list');
    const emptyState = $('empty-state');
    const summaryText = $('summary-text');
    const updateTime = $('update-time');
    const activeFilters = $('active-filters');
    const filterCountText = $('filter-count-text');
    const filterBadge = $('filter-badge');
    const searchInput = $('search-input');

    // ---- Initialization ----
    function init() {
        state.allPermits = generateSamplePermits();
        state.lastUpdated = new Date();

        setupEventListeners();
        setupInfiniteScroll();
        loadInitialData();
        setupDailyRefresh();
        requestNotificationPermission();
    }

    function loadInitialData() {
        loadingSpinner.classList.remove('hidden');
        feed.innerHTML = '';

        setTimeout(() => {
            state.currentPage = 0;
            state.displayedPermits = [];
            state.hasMore = true;
            loadNextPage();
            loadingSpinner.classList.add('hidden');
            updateSummary();
        }, 400);
    }

    // ---- Filtering ----
    function getFilteredPermits() {
        let filtered = state.allPermits.filter(p => {
            if (!state.filters.districts.has(p.district)) return false;
            if (!state.filters.statuses.has(p.status)) return false;
            if (state.filters.searchText) {
                const q = state.filters.searchText.toLowerCase();
                const fields = [p.applicant, p.owner, p.project, p.county, p.location, p.id];
                if (!fields.some(f => f.toLowerCase().includes(q))) return false;
            }
            return true;
        });

        switch (state.filters.sortOrder) {
            case 'oldest':
                filtered.sort((a, b) => a.dateUpdated - b.dateUpdated); break;
            case 'unitsHigh':
                filtered.sort((a, b) => b.units - a.units); break;
            case 'unitsLow':
                filtered.sort((a, b) => a.units - b.units); break;
            default:
                filtered.sort((a, b) => b.dateUpdated - a.dateUpdated);
        }
        return filtered;
    }

    function getActiveFilterCount() {
        let count = 0;
        if (state.filters.districts.size < Object.keys(DISTRICTS).length) count++;
        const defaultStatuses = new Set(['New Application', 'Approved']);
        if (state.filters.statuses.size !== defaultStatuses.size ||
            ![...state.filters.statuses].every(s => defaultStatuses.has(s))) count++;
        if (state.filters.sortOrder !== 'newest') count++;
        return count;
    }

    function applyFilters() {
        state.currentPage = 0;
        state.displayedPermits = [];
        state.hasMore = true;
        feed.innerHTML = '';
        endOfList.classList.add('hidden');
        loadNextPage();
        updateSummary();
        updateFilterUI();
    }

    function resetFilters() {
        state.filters.districts = new Set(Object.keys(DISTRICTS));
        state.filters.statuses = new Set(['New Application', 'Approved']);
        state.filters.sortOrder = 'newest';
        state.filters.searchText = '';
        searchInput.value = '';
        applyFilters();
    }

    // ---- Infinite Scroll ----
    function loadNextPage() {
        if (state.isLoading || !state.hasMore) return;
        state.isLoading = true;
        loadMore.classList.remove('hidden');

        const filtered = getFilteredPermits();
        const start = state.currentPage * state.pageSize;
        const end = Math.min(start + state.pageSize, filtered.length);

        if (start >= filtered.length) {
            state.hasMore = false;
            loadMore.classList.add('hidden');
            if (state.displayedPermits.length > 0) {
                endOfList.classList.remove('hidden');
            }
            if (state.displayedPermits.length === 0) {
                emptyState.classList.remove('hidden');
            }
            state.isLoading = false;
            return;
        }

        emptyState.classList.add('hidden');
        const newPermits = filtered.slice(start, end);

        setTimeout(() => {
            newPermits.forEach(permit => {
                state.displayedPermits.push(permit);
                feed.appendChild(createPermitCard(permit));
            });

            state.currentPage++;
            state.hasMore = end < filtered.length;
            loadMore.classList.add('hidden');

            if (!state.hasMore && state.displayedPermits.length > 0) {
                endOfList.classList.remove('hidden');
            }
            state.isLoading = false;
        }, 200);
    }

    function setupInfiniteScroll() {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadNextPage();
            }
        }, { rootMargin: '200px' });

        observer.observe(loadMore);
    }

    // ---- Card Rendering ----
    function createPermitCard(permit) {
        const card = document.createElement('div');
        card.className = 'permit-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        const statusConf = STATUS_CONFIG[permit.status];
        const district = DISTRICTS[permit.district];
        const timeAgo = formatTimeAgo(permit.dateUpdated);

        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge ${statusConf.cssClass}">
                    ${statusConf.icon} ${permit.status}
                </span>
                <span class="district-tag">${permit.district}</span>
            </div>
            <div class="card-project">${escapeHtml(permit.project)}</div>
            <div class="card-info">
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Units</div>
                        <div class="info-value">${permit.units} residential units</div>
                    </div>
                </div>
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Location</div>
                        <div class="info-value">${escapeHtml(permit.location)}</div>
                    </div>
                </div>
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Applicant</div>
                        <div class="info-value">${escapeHtml(permit.applicant)}</div>
                    </div>
                </div>
                <div class="info-item">
                    <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Owner</div>
                        <div class="info-value">${escapeHtml(permit.owner)}</div>
                    </div>
                </div>
            </div>
            <hr class="card-divider">
            <div class="card-footer">
                <span class="card-date">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${timeAgo}
                </span>
                <button class="district-link" data-url="${escapeHtml(permit.permitURL)}" onclick="event.stopPropagation(); window.open('${escapeHtml(permit.permitURL)}', '_blank');">
                    Search Permit Portal
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </button>
            </div>
        `;

        card.addEventListener('click', () => showDetail(permit));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter') showDetail(permit);
        });

        return card;
    }

    // ---- Detail View ----
    function showDetail(permit) {
        const modal = $('detail-modal');
        const body = $('detail-body');
        const district = DISTRICTS[permit.district];
        const statusConf = STATUS_CONFIG[permit.status];

        body.innerHTML = `
            <div class="detail-header-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span class="status-badge ${statusConf.cssClass}">
                        ${statusConf.icon} ${permit.status}
                    </span>
                    <span class="detail-district-name">${district.fullName}</span>
                </div>
                <div class="detail-project-name">${escapeHtml(permit.project)}</div>
                <div class="detail-app-number">${permit.id}</div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Project Details</div>
                <div class="detail-row">
                    <div class="info-label">Project</div>
                    <div class="info-value">${escapeHtml(permit.project)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">County</div>
                    <div class="info-value">${escapeHtml(permit.county)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Location</div>
                    <div class="info-value">${escapeHtml(permit.location)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Residential Units</div>
                    <div class="info-value">${permit.units}</div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Applicant & Owner</div>
                <div class="detail-row">
                    <div class="info-label">Applicant</div>
                    <div class="info-value">${escapeHtml(permit.applicant)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Owner</div>
                    <div class="info-value">${escapeHtml(permit.owner)}</div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Permit Information</div>
                <div class="detail-row">
                    <div class="info-label">Application #</div>
                    <div class="info-value">${permit.id}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Type</div>
                    <div class="info-value">${escapeHtml(permit.type)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">District</div>
                    <div class="info-value">${district.fullName}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Date Submitted</div>
                    <div class="info-value">${formatDate(permit.dateSubmitted)}</div>
                </div>
                <div class="detail-row">
                    <div class="info-label">Last Updated</div>
                    <div class="info-value">${formatDate(permit.dateUpdated)}</div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">Look Up This Permit</div>
                <div class="detail-row">
                    <div class="info-label">Search for this permit number on the district portal</div>
                    <div class="info-value" style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                        <code style="background:var(--bg);padding:6px 12px;border-radius:6px;font-size:16px;font-weight:600;letter-spacing:0.5px;">${escapeHtml(permit.id)}</code>
                        <button onclick="navigator.clipboard.writeText('${escapeHtml(permit.id)}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)" style="background:var(--primary);color:white;border:none;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Copy</button>
                    </div>
                </div>
            </div>

            <div class="detail-link-btn">
                <a href="${escapeHtml(permit.permitURL)}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Search on ${escapeHtml(district.shortName)} Permit Portal
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>
            </div>
        `;

        openModal(modal);
    }

    // ---- Filter Modal ----
    function buildFilterModal() {
        const districtContainer = $('district-filters');
        const statusContainer = $('status-filters');
        const sortContainer = $('sort-options');

        // Districts
        districtContainer.innerHTML = Object.values(DISTRICTS).map(d => `
            <div class="filter-toggle-row">
                <div class="filter-toggle-label">
                    <span class="filter-toggle-name">${d.code}</span>
                    <span class="filter-toggle-desc">${d.fullName}</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-district="${d.code}" ${state.filters.districts.has(d.code) ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');

        // Statuses
        const allStatuses = Object.keys(STATUS_CONFIG);
        statusContainer.innerHTML = allStatuses.map(s => `
            <div class="filter-toggle-row">
                <div class="filter-toggle-label">
                    <span class="filter-toggle-name">${STATUS_CONFIG[s].icon} ${s}</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" data-status="${s}" ${state.filters.statuses.has(s) ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');

        // Sort
        const sortOptions = [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'unitsHigh', label: 'Most Units' },
            { value: 'unitsLow', label: 'Fewest Units' }
        ];
        sortContainer.innerHTML = sortOptions.map(o => `
            <div class="sort-option" data-sort="${o.value}">
                <span>${o.label}</span>
                <span class="sort-check">${state.filters.sortOrder === o.value ? '✓' : ''}</span>
            </div>
        `).join('');

        // Events
        districtContainer.querySelectorAll('input[data-district]').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) state.filters.districts.add(cb.dataset.district);
                else state.filters.districts.delete(cb.dataset.district);
            });
        });

        statusContainer.querySelectorAll('input[data-status]').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) state.filters.statuses.add(cb.dataset.status);
                else state.filters.statuses.delete(cb.dataset.status);
            });
        });

        sortContainer.querySelectorAll('.sort-option').forEach(opt => {
            opt.addEventListener('click', () => {
                state.filters.sortOrder = opt.dataset.sort;
                sortContainer.querySelectorAll('.sort-check').forEach(c => c.textContent = '');
                opt.querySelector('.sort-check').textContent = '✓';
            });
        });
    }

    // ---- Settings Modal ----
    function buildSettingsModal() {
        const container = $('district-links');
        container.innerHTML = Object.values(DISTRICTS).map(d => `
            <a href="${d.url}" target="_blank" rel="noopener" class="district-link-item">
                <div class="district-info">
                    <span class="district-name">${d.code}</span>
                    <span class="district-full">${d.fullName}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </a>
        `).join('');
    }

    // ---- UI Updates ----
    function updateSummary() {
        const filtered = getFilteredPermits();
        const newApps = filtered.filter(p => p.status === 'New Application').length;
        const approved = filtered.filter(p => p.status === 'Approved').length;
        summaryText.textContent = `${newApps} new · ${approved} approved`;

        if (state.lastUpdated) {
            updateTime.textContent = `Updated ${formatTimeAgo(state.lastUpdated)}`;
        }
    }

    function updateFilterUI() {
        const count = getActiveFilterCount();
        if (count > 0) {
            activeFilters.classList.remove('hidden');
            filterCountText.textContent = `${count} filter(s) active`;
            filterBadge.classList.remove('hidden');
        } else {
            activeFilters.classList.add('hidden');
            filterBadge.classList.add('hidden');
        }
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
                state.filters.searchText = searchInput.value.trim();
                applyFilters();
            }, 300);
        });

        // Filter button
        $('filter-btn').addEventListener('click', () => {
            buildFilterModal();
            openModal($('filter-modal'));
        });

        // Filter done
        $('filter-done-btn').addEventListener('click', () => {
            closeModal($('filter-modal'));
            applyFilters();
        });

        // Reset all (in filter modal)
        $('reset-all-btn').addEventListener('click', () => {
            resetFilters();
            closeModal($('filter-modal'));
        });

        // Clear filters (in active filters bar)
        $('clear-filters-btn').addEventListener('click', resetFilters);

        // Reset filters (in empty state)
        $('reset-filters-btn').addEventListener('click', resetFilters);

        // Settings
        $('settings-btn').addEventListener('click', () => {
            buildSettingsModal();
            openModal($('settings-modal'));
        });

        $('settings-done-btn').addEventListener('click', () => {
            closeModal($('settings-modal'));
        });

        // Detail back
        $('detail-back-btn').addEventListener('click', () => {
            closeModal($('detail-modal'));
        });

        // Notification toggle
        $('notif-toggle').addEventListener('change', function() {
            if (this.checked) {
                requestNotificationPermission();
                $('notif-hint').textContent = 'Updates daily at 4:00 PM EST';
            } else {
                $('notif-hint').textContent = 'Notifications disabled';
            }
        });

        // Pull to refresh (swipe down at top)
        let touchStartY = 0;
        document.addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchEndY - touchStartY;
            if (diff > 100 && window.scrollY === 0) {
                refreshData();
            }
        }, { passive: true });
    }

    // ---- Daily Refresh at 4 PM EST ----
    function setupDailyRefresh() {
        function scheduleNext4PM() {
            const now = new Date();
            const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
            const target = new Date(est);
            target.setHours(16, 0, 0, 0);

            if (est >= target) {
                target.setDate(target.getDate() + 1);
            }

            const msUntil = target.getTime() - est.getTime();

            setTimeout(() => {
                refreshData();
                scheduleNext4PM();
            }, msUntil);
        }

        scheduleNext4PM();

        // Also check every 30 minutes if we missed the window
        setInterval(() => {
            const now = new Date();
            const estHour = parseInt(now.toLocaleString('en-US', {
                timeZone: 'America/New_York', hour: 'numeric', hour12: false
            }));
            const estMinute = parseInt(now.toLocaleString('en-US', {
                timeZone: 'America/New_York', minute: 'numeric'
            }));

            if (estHour === 16 && estMinute < 30) {
                const lastCheck = localStorage.getItem('lastDailyRefresh');
                const today = now.toDateString();
                if (lastCheck !== today) {
                    localStorage.setItem('lastDailyRefresh', today);
                    refreshData();
                    sendNotification('Permit Update Available',
                        'New Florida water management permit data is ready.');
                }
            }
        }, 30 * 60 * 1000);
    }

    function refreshData() {
        state.allPermits = generateSamplePermits();
        state.lastUpdated = new Date();
        applyFilters();
    }

    // ---- Notifications ----
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'icons/icon-192.png',
                badge: 'icons/icon-192.png'
            });
        }
    }

    // ---- Helpers ----
    function formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- Service Worker Registration ----
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // ---- Start ----
    document.addEventListener('DOMContentLoaded', init);
})();
