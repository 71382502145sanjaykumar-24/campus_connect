"use strict";
/**
 * CampusConnect Centralized Firebase Cloud Functions
 * Root exports for background triggers, trusted security endpoints, and backups.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledFirestoreBackup = exports.onMarksUpdated = exports.assignUserRole = exports.onUserCreated = void 0;
var onUserCreated_1 = require("./auth/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
var roleManagement_1 = require("./security/roleManagement");
Object.defineProperty(exports, "assignUserRole", { enumerable: true, get: function () { return roleManagement_1.assignUserRole; } });
var calculateGrades_1 = require("./academics/calculateGrades");
Object.defineProperty(exports, "onMarksUpdated", { enumerable: true, get: function () { return calculateGrades_1.onMarksUpdated; } });
var scheduledBackup_1 = require("./backup/scheduledBackup");
Object.defineProperty(exports, "scheduledFirestoreBackup", { enumerable: true, get: function () { return scheduledBackup_1.scheduledFirestoreBackup; } });
//# sourceMappingURL=index.js.map