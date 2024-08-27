import { exportAllUsers } from '../../../src/admin/services/exportService.js';

describe('Export All Users Performance Test', () => {
    jest.setTimeout(30000);

    it('should export all user data within 30 seconds', async () => {
        const startTime = process.hrtime();
        await exportAllUsers();
        const endTime = process.hrtime(startTime);
        const timeTaken = endTime[0] * 1000 + endTime[1] / 1000000;

        expect(timeTaken).toBeLessThan(30000);
    });
});
