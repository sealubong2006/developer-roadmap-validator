/**
 * Basic tests for validation service
 * Run with: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getCoreSkills, getSkillWeight, isCoreSkill } from '../src/config/roadmaps.js';
import { getPrerequisites, getLearningOrder } from '../src/config/prerequisites.js';

describe('Roadmaps Configuration', () => {
    it('should return core skills for frontend track', () => {
        const skills = getCoreSkills('frontend');
        assert.ok(skills.length > 0);
        assert.ok(skills.some(s => s.name === 'HTML'));
        assert.ok(skills.some(s => s.name === 'CSS'));
        assert.ok(skills.some(s => s.name === 'JavaScript'));
    });

    it('should return correct weight for a skill', () => {
        const weight = getSkillWeight('frontend', 'HTML');
        assert.strictEqual(weight, 10);
    });

    it('should identify core skills correctly', () => {
        assert.strictEqual(isCoreSkill('frontend', 'HTML'), true);
        assert.strictEqual(isCoreSkill('frontend', 'NonExistentSkill'), false);
    });

    it('should handle invalid track gracefully', () => {
        assert.throws(() => {
            getCoreSkills('invalidtrack');
        });
    });
});

describe('Prerequisites', () => {
    it('should return prerequisites for a skill', () => {
        const prereqs = getPrerequisites('frontend', 'React');
        assert.ok(prereqs.includes('JavaScript'));
        assert.ok(prereqs.includes('HTML'));
        assert.ok(prereqs.includes('CSS'));
    });

    it('should return empty array for fundamental skills', () => {
        const prereqs = getPrerequisites('frontend', 'HTML');
        assert.strictEqual(prereqs.length, 0);
    });

    it('should order skills based on dependencies', () => {
        const skills = ['React', 'JavaScript', 'HTML', 'CSS'];
        const ordered = getLearningOrder('frontend', skills);
        
        const htmlIndex = ordered.indexOf('HTML');
        const jsIndex = ordered.indexOf('JavaScript');
        const reactIndex = ordered.indexOf('React');
        
        assert.ok(htmlIndex < reactIndex);
        assert.ok(jsIndex < reactIndex);
    });
});

describe('Cache Service', () => {
    it('should set and get values', async () => {
        const { default: cacheService } = await import('../src/services/cacheService.js');
        
        cacheService.set('test-key', 'test-value');
        const value = cacheService.get('test-key');
        assert.strictEqual(value, 'test-value');
    });

    it('should expire values after TTL', async () => {
        const { default: cacheService } = await import('../src/services/cacheService.js');
        
        cacheService.set('expire-test', 'value', 100); // 100ms TTL
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const value = cacheService.get('expire-test');
        assert.strictEqual(value, null);
    });
});

console.log('Run tests with: npm test');
