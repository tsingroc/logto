import { managementResource } from '@logto/schemas/lib/seeds';
import { HTTPError } from 'got';

import { createResource, getResource, updateResource, deleteResource } from '@/api';
import { generateResourceIndicator, generateResourceName } from '@/utils';

describe('admin console api resources', () => {
  it('should get management api resource details successfully', async () => {
    const fetchedManagementApiResource = await getResource(managementResource.id);

    expect(fetchedManagementApiResource).toMatchObject(managementResource);
  });

  it('should create api resource successfully', async () => {
    const resourceName = generateResourceName();
    const resourceIndicator = generateResourceIndicator();

    const createdResource = await createResource(resourceName, resourceIndicator);

    expect(createdResource.name).toBe(resourceName);
    expect(createdResource.indicator).toBe(resourceIndicator);

    const fetchedCreatedResource = await getResource(createdResource.id);

    expect(fetchedCreatedResource).toBeTruthy();
  });

  it('should update api resource details successfully', async () => {
    const resource = await createResource();

    expect(resource).toBeTruthy();

    const newResourceName = `new_${resource.name}`;
    const newAccessTokenTtl = resource.accessTokenTtl + 100;

    const updatedResource = await updateResource(resource.id, {
      name: newResourceName,
      accessTokenTtl: newAccessTokenTtl,
    });

    expect(updatedResource.id).toBe(resource.id);
    expect(updatedResource.name).toBe(newResourceName);
    expect(updatedResource.accessTokenTtl).toBe(newAccessTokenTtl);
  });

  it('should delete api resource successfully', async () => {
    const createdResource = await createResource();

    expect(createdResource).toBeTruthy();

    await deleteResource(createdResource.id);

    const response = await getResource(createdResource.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
