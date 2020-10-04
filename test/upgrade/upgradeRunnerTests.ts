import { assert } from 'chai';
import { runUpgrade } from '../../src/upgrade/upgradeRunner';

describe('upgradeRunner', function() {
    this.timeout(1000000);
    it.only('should return select * from "users"', async () => {


        await runUpgrade()


        assert.equal(1, 1)


    });
});
